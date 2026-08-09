# 開發困難點：Next.js 15 + Firebase OAuth 登入後無法自動重定向與彈出視窗白屏

  ## 開發環境

  * 框架：Next.js 15 LTS (App Router / Turbopack)
  * 身分驗證：Firebase Auth (`signInWithPopup` + GoogleAuthProvider)
  * 後端：Firebase Admin SDK + Next.js Server Actions + Cookie Session
  * 瀏覽器環境：Chrome 現代安全政策環境

---

  ## 問題描述

  在開發 Next.js 15 搭配 Firebase Authentication 進行 Google OAuth 彈出式視窗登入時，遭遇以下連續無法解決的卡關問題：

  * 點擊 Google 登入後，彈出視窗呈現白色一片，且自動以預設帳號靜默認證後關閉，未跳出讓使用者選擇帳號的選單介面。
  * 彈出視窗認證完成並自動關閉後，母頁面依然停留在 `/login` 登入頁面，沒有自動重定向至 `/dashboard`。
  * 必須手動按下 F5 重新整理頁面，或是再次點擊一次 Google 登入，才能順利進入 `/dashboard`。

---

  ## 嘗試過失敗的做法與評估

  * 在登入頁使用 React `useEffect` 監聽 `user` 與 `loading` 狀態變更：
    - 嘗試做法：在 `useEffect` 中當 `!loading && user` 成立時執行 `router.push('/dashboard')`。
    - 失敗原因：`onAuthStateChanged` 為異步執行，在認證成功時，`setUser(currentUser)` 會在第一時間觸發，而此時初次加載殘留的 `loading` 狀態仍為 `false`。這導致跳轉在 Server Action 寫入 Session Cookie 完成之前過早觸發。當跳轉至 `/dashboard` 時，Middleware 檢測不到 Cookie 而將請求強行退回 `/login`。
  * 在 `onAuthStateChanged` 回呼函數開頭手動 `setLoading(true)`：
    - 嘗試做法：希望強行將 `loading` 鎖定為 `true`，直至 Cookie 與 Firestore profile 寫入完畢後才於 `finally` 區塊解鎖。
    - 失敗原因：雖然防範了資料庫死鎖，但依然無法解決 COOP 瀏覽器跨來源安全政策導致的視窗訊息斷聯。

---

  ## 最後有效的解決方法

  最終確認該問題由「瀏覽器 COOP 安全政策阻斷視窗通訊」與「登入流程順序解耦」兩大核心因素共同導致。完整解決方案如下：

  * 1. 修正 `next.config.ts` 中的 COOP 標頭 (Cross-Origin-Opener-Policy)
    - 在 Next.js 設定檔中新增 `same-origin-allow-popups` 標頭。現代瀏覽器預設的 `same-origin` 政策會切斷 OAuth 彈出視窗與母視窗之間的跨來源通訊，導致 Firebase SDK 無法收到視窗回傳的認證 Token：
      ```typescript
      import type { NextConfig } from "next";

      const nextConfig: NextConfig = {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin-allow-popups",
                },
              ],
            },
          ];
        },
      };

      export default nextConfig;
      ```

  * 2. 重構 `AuthContext.tsx` 登入函數的同步順序
    - 將 `signInWithGoogle` 重構為內聯同步阻塞函數。在函數回傳前，保證依序完成 `signInWithPopup` -> Firestore profile 寫入/查詢 -> `getIdToken` -> `createSessionCookie`。
    - 確保在 Server Action 完成 Cookie 寫入後，函數才回傳成功訊號：
      ```typescript
      const signInWithGoogle = async () => {
        try {
          setLoading(true);
          const result = await signInWithPopup(auth, googleProvider);
          const currentUser = result.user;

          // 同步 Firestore Profile
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: "free",
              authProvider: "google",
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          } else {
            setUserProfile(userSnap.data() as UserProfile);
          }

          // 於回傳前完成 Cookie 寫入
          const token = await currentUser.getIdToken(true);
          await createSessionCookie(token);
          setUser(currentUser);
        } catch (error) {
          console.error("Error signing in with Google:", error);
          throw error;
        } finally {
          setLoading(false);
        }
      };
      ```

  * 3. 在登入頁按鈕處理函數中直接執行 `router.push('/dashboard')`
    - 在 `login/page.tsx` 中，直接在 `await signInWithGoogle()` 後執行 `router.push('/dashboard')`。此時 Cookie 100% 已在瀏覽器中生效，Middleware 順利放行。

  * 4. 在 `firebase.ts` 設定強制跳出帳號選擇選單
    - 解決彈出視窗白色一片且自動以預設帳號登入的問題：
      ```typescript
      export const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });
      ```
