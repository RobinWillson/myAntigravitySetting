# MCP Chrome Tool List

This document lists all the available tools supported by the `mcp-chrome-bridge` plugin.

## Quick Navigation Table

| Tool Name | Description |
| :--- | :--- |
| [`get_windows_and_tabs`](#get_windows_and_tabs) | Get all currently open browser windows and tabs |
| [`performance_start_trace`](#performance_start_trace) | Starts a performance trace recording on the selected page. Optionally reloads the page and/or auto-stops after a short duration. |
| [`performance_stop_trace`](#performance_stop_trace) | Stops the active performance trace recording on the selected page. |
| [`performance_analyze_insight`](#performance_analyze_insight) | Provides a lightweight summary of the last recorded trace. For deep insights (CWV, breakdowns), integrate native-side DevTools trace engine. |
| [`chrome_read_page`](#chrome_read_page) | Get an accessibility tree representation of visible elements on the page. Only returns elements that are visible in the viewport. Optionally filter for only interactive elements. |
| [`chrome_computer`](#chrome_computer) | Use a mouse and keyboard to interact with a web browser, and take screenshots. |
| [`chrome_navigate`](#chrome_navigate) | Navigate to a URL, refresh the current tab, or navigate browser history (back/forward) |
| [`chrome_screenshot`](#chrome_screenshot) | [Prefer read_page over taking a screenshot and Prefer chrome_computer] Take a screenshot of the current page or a specific element. For new usage, use chrome_computer with action="screenshot". Use this tool if you need advanced options. |
| [`chrome_close_tabs`](#chrome_close_tabs) | Close one or more browser tabs |
| [`chrome_switch_tab`](#chrome_switch_tab) | Switch to a specific browser tab |
| [`chrome_get_web_content`](#chrome_get_web_content) | Fetch content from a web page |
| [`chrome_network_request`](#chrome_network_request) | Send a network request from the browser with cookies and other browser context |
| [`chrome_network_capture`](#chrome_network_capture) | Unified network capture tool. Use action="start" to begin capturing, action="stop" to end and retrieve results. Set needResponseBody=true to capture response bodies (uses Debugger API, may conflict with DevTools). Default mode uses webRequest API (lightweight, no debugger conflict, but no response body). |
| [`chrome_handle_download`](#chrome_handle_download) | Wait for a browser download and return details (id, filename, url, state, size) |
| [`chrome_history`](#chrome_history) | Retrieve and search browsing history from Chrome |
| [`chrome_bookmark_search`](#chrome_bookmark_search) | Search Chrome bookmarks by title and URL |
| [`chrome_bookmark_add`](#chrome_bookmark_add) | Add a new bookmark to Chrome |
| [`chrome_bookmark_delete`](#chrome_bookmark_delete) | Delete a bookmark from Chrome |
| [`chrome_javascript`](#chrome_javascript) | Execute JavaScript code in a browser tab and return the result. Uses CDP Runtime.evaluate with awaitPromise and returnByValue; automatically falls back to chrome.scripting.executeScript if the debugger is busy. Output is sanitized (sensitive data redacted) and truncated by default. |
| [`chrome_click_element`](#chrome_click_element) | Click on an element in a web page. Supports multiple targeting methods: CSS selector, XPath, element ref (from chrome_read_page), or viewport coordinates. More focused than chrome_computer for simple click operations. |
| [`chrome_fill_or_select`](#chrome_fill_or_select) | Fill or select a form element on a web page. Supports input, textarea, select, checkbox, and radio elements. Use CSS selector, XPath, or element ref to target the element. |
| [`chrome_request_element_selection`](#chrome_request_element_selection) | Request the user to manually select one or more elements on the current page. Use this as a human-in-the-loop fallback when you cannot reliably locate the target element after approximately 3 attempts using chrome_read_page combined with chrome_click_element/chrome_fill_or_select/chrome_computer. The user will see a panel with instructions and can click on the requested elements. Returns element refs compatible with chrome_click_element/chrome_fill_or_select (including iframe frameId for cross-frame support). |
| [`chrome_keyboard`](#chrome_keyboard) | Simulate keyboard input on a web page. Supports single keys (Enter, Tab, Escape), key combinations (Ctrl+C, Ctrl+V), and text input. Can target a specific element or send to the focused element. |
| [`chrome_console`](#chrome_console) | Capture console output from a browser tab. Supports snapshot mode (default; one-time capture with ~2s wait) and buffer mode (persistent per-tab buffer you can read/clear instantly without waiting). |
| [`chrome_upload_file`](#chrome_upload_file) | Upload files to web forms with file input elements using Chrome DevTools Protocol |
| [`chrome_handle_dialog`](#chrome_handle_dialog) | Handle JavaScript dialogs (alert/confirm/prompt) via CDP |
| [`chrome_gif_recorder`](#chrome_gif_recorder) | Record browser tab activity as an animated GIF. |

---

## Tool Details

### <a name="get_windows_and_tabs"></a>`get_windows_and_tabs`

Get all currently open browser windows and tabs

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |


---

### <a name="performance_start_trace"></a>`performance_start_trace`

Starts a performance trace recording on the selected page. Optionally reloads the page and/or auto-stops after a short duration.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `reload` | `boolean` | No | Determines if, once tracing has started, the page should be automatically reloaded (ignore cache). |
| `autoStop` | `boolean` | No | Determines if the trace should be automatically stopped (default false). |
| `durationMs` | `number` | No | Auto-stop duration in milliseconds when autoStop is true (default 5000). |


---

### <a name="performance_stop_trace"></a>`performance_stop_trace`

Stops the active performance trace recording on the selected page.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `saveToDownloads` | `boolean` | No | Whether to save the trace as a JSON file in Downloads (default true). |
| `filenamePrefix` | `string` | No | Optional filename prefix for the downloaded trace JSON. |


---

### <a name="performance_analyze_insight"></a>`performance_analyze_insight`

Provides a lightweight summary of the last recorded trace. For deep insights (CWV, breakdowns), integrate native-side DevTools trace engine.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `insightName` | `string` | No | Optional insight name for future deep analysis (e.g., "DocumentLatency"). Currently informational only. |
| `timeoutMs` | `number` | No | Timeout for deep analysis via native host (milliseconds). Default 60000. Increase for large traces. |


---

### <a name="chrome_read_page"></a>`chrome_read_page`

Get an accessibility tree representation of visible elements on the page. Only returns elements that are visible in the viewport. Optionally filter for only interactive elements.
Tip: If the returned elements do not include the specific element you need, use the computer tool's screenshot (action="screenshot") to capture the element's on-screen coordinates, then operate by coordinates.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `filter` | `string` | No | Filter elements: "interactive" for such as  buttons/links/inputs only (default: all visible elements) |
| `depth` | `number` | No | Maximum DOM depth to traverse (integer >= 0). Lower values reduce output size and can improve performance. |
| `refId` | `string` | No | Focus on the subtree rooted at this element refId (e.g., "ref_12"). The refId must come from a recent chrome_read_page response in the same tab (refs may expire). |
| `tabId` | `number` | No | Target an existing tab by ID (default: active tab). |
| `windowId` | `number` | No | Target window ID to pick active tab when tabId is omitted. |


---

### <a name="chrome_computer"></a>`chrome_computer`

Use a mouse and keyboard to interact with a web browser, and take screenshots.
* Whenever you intend to click on an element like an icon, you should consult a read_page to determine the ref of the element before moving the cursor.
* If you tried clicking on a program or link but it failed to load, even after waiting, try screenshot and then adjusting your click location so that the tip of the cursor visually falls on the element that you want to click.
* Make sure to click any buttons, links, icons, etc with the cursor tip in the center of the element. Don't click boxes on their edges unless asked.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `tabId` | `number` | No | Target tab ID (default: active tab) |
| `background` | `boolean` | No | Avoid focusing/activating tab/window for certain operations (best-effort). Default: false |
| `action` | `string` | Yes | Action to perform: left_click | right_click | double_click | triple_click | left_click_drag | scroll | scroll_to | type | key | fill | fill_form | hover | wait | resize_page | zoom | screenshot |
| `ref` | `string` | No | Element ref from chrome_read_page. For click/scroll/scroll_to/key/type and drag end when provided; takes precedence over coordinates. |
| `coordinates` | `object` | No | Coordinates for actions (in screenshot space if a recent screenshot was taken, otherwise viewport). Required for click/scroll and as end point for drag. |
| `startCoordinates` | `object` | No | Starting coordinates for drag action |
| `startRef` | `string` | No | Drag start ref from chrome_read_page (alternative to startCoordinates). |
| `scrollDirection` | `string` | No | Scroll direction: up | down | left | right |
| `scrollAmount` | `number` | No | Scroll ticks (1-10), default 3 |
| `text` | `string` | No | Text to type (for action=type) or keys/chords separated by space (for action=key, e.g. "Backspace Enter" or "cmd+a") |
| `repeat` | `number` | No | For action=key: number of times to repeat the key sequence (integer 1-100, default 1). |
| `modifiers` | `object` | No | Modifier keys for click actions (left_click/right_click/double_click/triple_click). |
| `region` | `object` | No | For action=zoom: rectangular region to capture (x0,y0)-(x1,y1) in viewport pixels (or screenshot-space if a recent screenshot context exists). |
| `selector` | `string` | No | CSS selector for fill (alternative to ref). |
| `value` | `any` | No | Value to set for action=fill (string | boolean | number) |
| `elements` | `array` | No | For action=fill_form: list of elements to fill (ref + value) |
| `width` | `number` | No | For action=resize_page: viewport width |
| `height` | `number` | No | For action=resize_page: viewport height |
| `appear` | `boolean` | No | For action=wait with text: whether to wait for the text to appear (true, default) or disappear (false) |
| `timeout` | `number` | No | For action=wait with text: timeout in milliseconds (default 10000, max 120000) |
| `duration` | `number` | No | Seconds to wait for action=wait (max 30s) |


---

### <a name="chrome_navigate"></a>`chrome_navigate`

Navigate to a URL, refresh the current tab, or navigate browser history (back/forward)

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | No | URL to navigate to. Special values: "back" or "forward" to navigate browser history in the target tab. |
| `newWindow` | `boolean` | No | Create a new window to navigate to the URL or not. Defaults to false |
| `tabId` | `number` | No | Target an existing tab by ID (if provided, navigate/refresh/back/forward that tab instead of the active tab). |
| `windowId` | `number` | No | Target an existing window by ID (when creating a new tab in existing window, or picking active tab if tabId is not provided). |
| `background` | `boolean` | No | Perform the operation without stealing focus (do not activate the tab or focus the window). Default: false |
| `width` | `number` | No | Window width in pixels (default: 1280). When width or height is provided, a new window will be created. |
| `height` | `number` | No | Window height in pixels (default: 720). When width or height is provided, a new window will be created. |
| `refresh` | `boolean` | No | Refresh the current active tab instead of navigating to a URL. When true, the url parameter is ignored. Defaults to false |


---

### <a name="chrome_screenshot"></a>`chrome_screenshot`

[Prefer read_page over taking a screenshot and Prefer chrome_computer] Take a screenshot of the current page or a specific element. For new usage, use chrome_computer with action="screenshot". Use this tool if you need advanced options.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | No | Name for the screenshot, if saving as PNG |
| `selector` | `string` | No | CSS selector for element to screenshot |
| `tabId` | `number` | No | Target tab ID to capture from (default: active tab). |
| `windowId` | `number` | No | Target window ID to pick active tab from when tabId is not provided. |
| `background` | `boolean` | No | Attempt capture without bringing tab/window to foreground. CDP-based capture is used for simple viewport captures. For element/full-page capture, the tab may still be made active in its window without focusing the window. Default: false |
| `width` | `number` | No | Width in pixels (default: 800) |
| `height` | `number` | No | Height in pixels (default: 600) |
| `storeBase64` | `boolean` | No | return screenshot in base64 format (default: false) if you want to see the page, recommend set this to be true |
| `fullPage` | `boolean` | No | Store screenshot of the entire page (default: true) |
| `savePng` | `boolean` | No | Save screenshot as PNG file (default: true)，if you want to see the page, recommend set this to be false, and set storeBase64 to be true |


---

### <a name="chrome_close_tabs"></a>`chrome_close_tabs`

Close one or more browser tabs

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `tabIds` | `array` | No | Array of tab IDs to close. If not provided, will close the active tab. |
| `url` | `string` | No | Close tabs matching this URL. Can be used instead of tabIds. |


---

### <a name="chrome_switch_tab"></a>`chrome_switch_tab`

Switch to a specific browser tab

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `tabId` | `number` | Yes | The ID of the tab to switch to. |
| `windowId` | `number` | No | The ID of the window where the tab is located. |


---

### <a name="chrome_get_web_content"></a>`chrome_get_web_content`

Fetch content from a web page

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | No | URL to fetch content from. If not provided, uses the current active tab |
| `tabId` | `number` | No | Target an existing tab by ID (default: active tab). |
| `background` | `boolean` | No | Do not activate tab/focus window while fetching (default: false) |
| `htmlContent` | `boolean` | No | Get the visible HTML content of the page. If true, textContent will be ignored (default: false) |
| `textContent` | `boolean` | No | Get the visible text content of the page with metadata. Ignored if htmlContent is true (default: true) |
| `selector` | `string` | No | CSS selector to get content from a specific element. If provided, only content from this element will be returned |


---

### <a name="chrome_network_request"></a>`chrome_network_request`

Send a network request from the browser with cookies and other browser context

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | Yes | URL to send the request to |
| `method` | `string` | No | HTTP method to use (default: GET) |
| `headers` | `object` | No | Headers to include in the request |
| `body` | `string` | No | Body of the request (for POST, PUT, etc.) |
| `timeout` | `number` | No | Timeout in milliseconds (default: 30000) |
| `formData` | `object` | No | Multipart/form-data descriptor. If provided, overrides body and builds FormData with optional file attachments. Shape: { fields?: Record<string,string|number|boolean>, files?: Array<{ name: string, fileUrl?: string, filePath?: string, base64Data?: string, filename?: string, contentType?: string }> }. Also supports a compact array form: [ [name, fileSpec, filename?], ... ] where fileSpec may be url:, file:, or base64:. |


---

### <a name="chrome_network_capture"></a>`chrome_network_capture`

Unified network capture tool. Use action="start" to begin capturing, action="stop" to end and retrieve results. Set needResponseBody=true to capture response bodies (uses Debugger API, may conflict with DevTools). Default mode uses webRequest API (lightweight, no debugger conflict, but no response body).

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `action` | `string` | Yes | Action to perform: "start" begins capture, "stop" ends and returns results |
| `needResponseBody` | `boolean` | No | When true, captures response body using Debugger API (default: false). Only use when you need to inspect response content. |
| `url` | `string` | No | URL to capture network requests from. For action="start". If not provided, uses the current active tab. |
| `maxCaptureTime` | `number` | No | Maximum capture time in milliseconds (default: 180000) |
| `inactivityTimeout` | `number` | No | Stop after inactivity in milliseconds (default: 60000). Set 0 to disable. |
| `includeStatic` | `boolean` | No | Include static resources like images/scripts/styles (default: false) |


---

### <a name="chrome_handle_download"></a>`chrome_handle_download`

Wait for a browser download and return details (id, filename, url, state, size)

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `filenameContains` | `string` | No | Filter by substring in filename or URL |
| `timeoutMs` | `number` | No | Timeout in ms (default 60000, max 300000) |
| `waitForComplete` | `boolean` | No | Wait until completed (default true) |


---

### <a name="chrome_history"></a>`chrome_history`

Retrieve and search browsing history from Chrome

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | No | Text to search for in history URLs and titles. Leave empty to retrieve all history entries within the time range. |
| `startTime` | `string` | No | Start time as a date string. Supports ISO format (e.g., "2023-10-01", "2023-10-01T14:30:00"), relative times (e.g., "1 day ago", "2 weeks ago", "3 months ago", "1 year ago"), and special keywords ("now", "today", "yesterday"). Default: 24 hours ago |
| `endTime` | `string` | No | End time as a date string. Supports ISO format (e.g., "2023-10-31", "2023-10-31T14:30:00"), relative times (e.g., "1 day ago", "2 weeks ago", "3 months ago", "1 year ago"), and special keywords ("now", "today", "yesterday"). Default: current time |
| `maxResults` | `number` | No | Maximum number of history entries to return. Use this to limit results for performance or to focus on the most relevant entries. (default: 100) |
| `excludeCurrentTabs` | `boolean` | No | When set to true, filters out URLs that are currently open in any browser tab. Useful for finding pages you've visited but don't have open anymore. (default: false) |


---

### <a name="chrome_bookmark_search"></a>`chrome_bookmark_search`

Search Chrome bookmarks by title and URL

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `query` | `string` | No | Search query to match against bookmark titles and URLs. Leave empty to retrieve all bookmarks. |
| `maxResults` | `number` | No | Maximum number of bookmarks to return (default: 50) |
| `folderPath` | `string` | No | Optional folder path or ID to limit search to a specific bookmark folder. Can be a path string (e.g., "Work/Projects") or a folder ID. |


---

### <a name="chrome_bookmark_add"></a>`chrome_bookmark_add`

Add a new bookmark to Chrome

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | No | URL to bookmark. If not provided, uses the current active tab URL. |
| `title` | `string` | No | Title for the bookmark. If not provided, uses the page title from the URL. |
| `parentId` | `string` | No | Parent folder path or ID to add the bookmark to. Can be a path string (e.g., "Work/Projects") or a folder ID. If not provided, adds to the "Bookmarks Bar" folder. |
| `createFolder` | `boolean` | No | Whether to create the parent folder if it does not exist (default: false) |


---

### <a name="chrome_bookmark_delete"></a>`chrome_bookmark_delete`

Delete a bookmark from Chrome

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookmarkId` | `string` | No | ID of the bookmark to delete. Either bookmarkId or url must be provided. |
| `url` | `string` | No | URL of the bookmark to delete. Used if bookmarkId is not provided. |
| `title` | `string` | No | Title of the bookmark to help with matching when deleting by URL. |


---

### <a name="chrome_javascript"></a>`chrome_javascript`

Execute JavaScript code in a browser tab and return the result. Uses CDP Runtime.evaluate with awaitPromise and returnByValue; automatically falls back to chrome.scripting.executeScript if the debugger is busy. Output is sanitized (sensitive data redacted) and truncated by default.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `code` | `string` | Yes | JavaScript code to execute. Runs inside an async function body, so top-level await and "return ..." are supported. |
| `tabId` | `number` | No | Target tab ID. If omitted, uses the current active tab. |
| `timeoutMs` | `number` | No | Execution timeout in milliseconds (default: 15000). |
| `maxOutputBytes` | `number` | No | Maximum output size in bytes after sanitization (default: 51200). Output exceeding this limit will be truncated. |


---

### <a name="chrome_click_element"></a>`chrome_click_element`

Click on an element in a web page. Supports multiple targeting methods: CSS selector, XPath, element ref (from chrome_read_page), or viewport coordinates. More focused than chrome_computer for simple click operations.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `selector` | `string` | No | CSS selector or XPath for the element to click. |
| `selectorType` | `string` | No | Type of selector (default: "css"). |
| `ref` | `string` | No | Element ref from chrome_read_page (takes precedence over selector). |
| `coordinates` | `object` | No | Viewport coordinates to click at. |
| `double` | `boolean` | No | Perform double click when true (default: false). |
| `button` | `string` | No | Mouse button to click (default: "left"). |
| `modifiers` | `object` | No | Modifier keys to hold during click. |
| `waitForNavigation` | `boolean` | No | Wait for navigation to complete after click (default: false). |
| `timeout` | `number` | No | Timeout in milliseconds for waiting (default: 5000). |
| `tabId` | `number` | No | Target tab ID. If omitted, uses the current active tab. |
| `windowId` | `number` | No | Window ID to select active tab from (when tabId is omitted). |
| `frameId` | `number` | No | Target frame ID for iframe support. |


---

### <a name="chrome_fill_or_select"></a>`chrome_fill_or_select`

Fill or select a form element on a web page. Supports input, textarea, select, checkbox, and radio elements. Use CSS selector, XPath, or element ref to target the element.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `selector` | `string` | No | CSS selector or XPath for the form element. |
| `selectorType` | `string` | No | Type of selector (default: "css"). |
| `ref` | `string` | No | Element ref from chrome_read_page (takes precedence over selector). |
| `value` | `string,number,boolean` | Yes | Value to fill. For text inputs: string. For checkboxes/radios: boolean. For selects: option value or text. |
| `tabId` | `number` | No | Target tab ID. If omitted, uses the current active tab. |
| `windowId` | `number` | No | Window ID to select active tab from (when tabId is omitted). |
| `frameId` | `number` | No | Target frame ID for iframe support. |


---

### <a name="chrome_request_element_selection"></a>`chrome_request_element_selection`

Request the user to manually select one or more elements on the current page. Use this as a human-in-the-loop fallback when you cannot reliably locate the target element after approximately 3 attempts using chrome_read_page combined with chrome_click_element/chrome_fill_or_select/chrome_computer. The user will see a panel with instructions and can click on the requested elements. Returns element refs compatible with chrome_click_element/chrome_fill_or_select (including iframe frameId for cross-frame support).

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `requests` | `array` | Yes | A list of element selection requests. Each request produces exactly one picked element. The user will see these requests in a panel and select each element by clicking on the page. |
| `timeoutMs` | `number` | No | Timeout in milliseconds for the user to complete all selections. Default: 180000 (3 minutes). Maximum: 600000 (10 minutes). |
| `tabId` | `number` | No | Target tab ID. If omitted, uses the current active tab. |
| `windowId` | `number` | No | Window ID to select active tab from (when tabId is omitted). |


---

### <a name="chrome_keyboard"></a>`chrome_keyboard`

Simulate keyboard input on a web page. Supports single keys (Enter, Tab, Escape), key combinations (Ctrl+C, Ctrl+V), and text input. Can target a specific element or send to the focused element.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `keys` | `string` | Yes | Keys or key combinations to simulate. Examples: "Enter", "Tab", "Ctrl+C", "Shift+Tab", "Hello World". |
| `selector` | `string` | No | CSS selector or XPath for target element to receive keyboard events. |
| `selectorType` | `string` | No | Type of selector (default: "css"). |
| `delay` | `number` | No | Delay between keystrokes in milliseconds (default: 50). |
| `tabId` | `number` | No | Target tab ID. If omitted, uses the current active tab. |
| `windowId` | `number` | No | Window ID to select active tab from (when tabId is omitted). |
| `frameId` | `number` | No | Target frame ID for iframe support. |


---

### <a name="chrome_console"></a>`chrome_console`

Capture console output from a browser tab. Supports snapshot mode (default; one-time capture with ~2s wait) and buffer mode (persistent per-tab buffer you can read/clear instantly without waiting).

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | No | URL to navigate to and capture console from. If not provided, uses the current active tab |
| `tabId` | `number` | No | Target an existing tab by ID (default: active tab). |
| `windowId` | `number` | No | Target window ID to pick active tab when tabId is omitted. |
| `background` | `boolean` | No | Do not activate tab/focus window when capturing via CDP. Default: false |
| `includeExceptions` | `boolean` | No | Include uncaught exceptions in the output (default: true) |
| `maxMessages` | `number` | No | Maximum number of console messages to capture in snapshot mode (default: 100). If limit is provided, it takes precedence. |
| `mode` | `string` | No | Console capture mode: snapshot (default; waits ~2s for messages) or buffer (persistent per-tab buffer; reads from memory instantly). |
| `buffer` | `boolean` | No | Alias for mode="buffer" (default: false). |
| `clear` | `boolean` | No | Buffer mode only: clear the buffered logs for this tab before reading (default: false). Use clearAfterRead instead to clear after reading (mcp-tools.js style). |
| `clearAfterRead` | `boolean` | No | Buffer mode only: clear the buffered logs for this tab AFTER reading, to avoid duplicate messages on subsequent calls (default: false). This matches mcp-tools.js behavior. |
| `pattern` | `string` | No | Optional regex filter applied to message/exception text. Supports /pattern/flags syntax. |
| `onlyErrors` | `boolean` | No | Only return error-level console messages (and exceptions when includeExceptions=true). Default: false. |
| `limit` | `number` | No | Limit returned console messages. In snapshot mode this is an alias for maxMessages; in buffer mode it limits returned messages from the buffer. |


---

### <a name="chrome_upload_file"></a>`chrome_upload_file`

Upload files to web forms with file input elements using Chrome DevTools Protocol

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `tabId` | `number` | No | Target tab ID (default: active tab) |
| `windowId` | `number` | No | Target window ID to pick active tab when tabId is omitted |
| `selector` | `string` | Yes | CSS selector for the file input element (input[type="file"]) |
| `filePath` | `string` | No | Local file path to upload |
| `fileUrl` | `string` | No | URL to download file from before uploading |
| `base64Data` | `string` | No | Base64 encoded file data to upload |
| `fileName` | `string` | No | Optional filename when using base64 or URL (default: "uploaded-file") |
| `multiple` | `boolean` | No | Whether the input accepts multiple files (default: false) |


---

### <a name="chrome_handle_dialog"></a>`chrome_handle_dialog`

Handle JavaScript dialogs (alert/confirm/prompt) via CDP

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `action` | `string` | Yes | accept | dismiss |
| `promptText` | `string` | No | Optional prompt text when accepting a prompt |


---

### <a name="chrome_gif_recorder"></a>`chrome_gif_recorder`

Record browser tab activity as an animated GIF.

Modes:
- Fixed FPS mode (action="start"): Captures frames at regular intervals. Good for animations/videos.
- Auto-capture mode (action="auto_start"): Captures frames automatically when chrome_computer or chrome_navigate actions succeed. Better for interaction recordings with natural pacing.

Use "stop" to end recording and save the GIF.

#### Parameters

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `action` | `string` | Yes | Action to perform: - "start": Begin fixed-FPS recording (captures frames at regular intervals) - "auto_start": Begin auto-capture mode (frames captured on tool actions) - "stop": End recording and save GIF - "status": Get current recording state - "capture": Manually trigger a frame capture in auto mode - "clear": Clear all recording state and cached GIF without saving - "export": Export the last recorded GIF (download or drag&drop upload) |
| `tabId` | `number` | No | Target tab ID (default: active tab). Used with "start"/"auto_start" for recording, and with "export" (download=false) for drag&drop upload target. |
| `fps` | `number` | No | Frames per second for fixed-FPS mode (1-30, default: 5). Higher values = smoother but larger file. |
| `durationMs` | `number` | No | Maximum recording duration in milliseconds (default: 5000, max: 60000). Only for fixed-FPS mode. |
| `maxFrames` | `number` | No | Maximum number of frames to capture (default: 50 for fixed-FPS, 100 for auto mode, max: 300). |
| `width` | `number` | No | Output GIF width in pixels (default: 800, max: 1920). |
| `height` | `number` | No | Output GIF height in pixels (default: 600, max: 1080). |
| `maxColors` | `number` | No | Maximum colors in palette (default: 256). Lower values = smaller file size. |
| `filename` | `string` | No | Output filename (without extension). Defaults to timestamped name. |
| `captureDelayMs` | `number` | No | Auto-capture mode only: Delay in ms after action before capturing frame (default: 150). Allows UI to stabilize. |
| `frameDelayCs` | `number` | No | Auto-capture mode only: Display duration per frame in centiseconds (default: 20 = 200ms per frame). |
| `annotation` | `string` | No | Auto-capture mode only (action="capture"): Optional text label to render on the captured frame. |
| `download` | `boolean` | No | Export action only: Set to true (default) to download the GIF, or false to upload via drag&drop. |
| `coordinates` | `object` | No | Export action only (when download=false): Target coordinates for drag&drop upload. |
| `ref` | `string` | No | Export action only (when download=false): Element ref from chrome_read_page for drag&drop target. |
| `selector` | `string` | No | Export action only (when download=false): CSS selector for drag&drop target element. |
| `enhancedRendering` | `object` | No | Auto-capture mode only: Configure visual overlays for recorded actions (click indicators, drag paths, labels). Pass `true` to enable all defaults. |


---

