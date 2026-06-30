# Function Analysis of mcp-chrome-bridge

## Overview
`mcp-chrome-bridge` acts as a Native Messaging Host that bridges communication between Chrome/Chromium extensions and local MCP clients. It supports bidirectional communication and provides a set of tools exposed via the Model Context Protocol.

## Opening New Windows/Tabs
Based on the exported tool types and previous diagnostic traces, **Yes**, `mcp-chrome-bridge` does support opening new windows and tabs.
The core tool for this action is `chrome_navigate`. It supports the following parameters to control window/tab creation:
- `url`: The destination URL.
- `newWindow`: A boolean flag (e.g., `true`) to open the URL in a completely new window or tab.
- `tabId`: To specify navigating within an existing tab.

## Available Functions (Tool Names)
The bridge exposes the following categories of browser functions as MCP tools:

### Browser Control & Navigation
- `chrome_get_windows_and_tabs`: List current windows and tabs.
- `chrome_search_tabs_content`: Search across open tabs.
- `chrome_navigate`: Navigate to a URL, optionally in a new window/tab.
- `chrome_switch_tab`: Switch active tab.
- `chrome_close_tabs`: Close specified tabs.
- `chrome_history`: Access browser history.
- `chrome_read_page`: Read the text content of a page.

### Page Interaction
- `chrome_click`: Click on page elements.
- `chrome_fill`: Fill input fields.
- `chrome_keyboard`: Simulate keyboard input.
- `chrome_request_element_selection`: Interactive element selection.
- `chrome_get_interactive_elements`: Retrieve interactive DOM elements.
- `chrome_handle_dialog`: Handle alert/confirm dialogs.
- `chrome_file_upload`: Handle file uploads.

### Debugging & Network
- `chrome_network_capture_start` / `stop`: Capture network requests.
- `chrome_network_request`: Analyze specific requests.
- `chrome_console`: Read console logs.
- `chrome_inject_script` / `chrome_javascript`: Execute JavaScript on the page.

### Performance & Utilities
- `chrome_screenshot`: Take a screenshot of the viewport.
- `chrome_gif_recorder`: Record screen/page interactions.
- `chrome_performance_start_trace` / `stop`: Profile page performance.

### Workflows
- `flow_run`: Execute an automated Record & Replay flow.
