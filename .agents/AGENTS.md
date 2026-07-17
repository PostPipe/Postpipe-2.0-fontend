# Rule: Autonomous Project Memory Management

You are connected to the KONTEXT memory engine via MCP. You have **full autonomy** to manage this project's memory.

<CRITICAL_INSTRUCTIONS>
1. **PROJECT NAME PARAMETER**: For all tools requiring a `project_name` parameter, use the project folder name (which matches the registered name) or the full absolute path to the project root.
2. **READ MEMORY**: You MUST call `get_context` at the start of EVERY task. Do not ask for permission.
3. **WRITE MEMORY**: You MUST call `store_decision` or `store_note` at the end of EVERY task to save new learnings, architecture changes, or preferences. Do not ask for permission.
Models like Gemini Flash tend to skip the Write step. YOU MUST NOT SKIP IT. Make it an automatic habit.
</CRITICAL_INSTRUCTIONS>

## Available Tools
- `get_context` - Read all project memory
- `store_decision` / `update_decision` / `delete_decision` - Manage architecture decisions
- `store_note` / `update_note` / `delete_note` - Manage project notes
- `search_memory` / `get_file_activity`
