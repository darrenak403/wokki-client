# Wokki Client — Claude Code

@AGENTS.md

Branch workspace rule lives in AGENTS.md: Org Admin sees all chi nhánh trong org, but UI workspace/sidebar actions are scoped to the selected `locationId`; Manager scoped; PlatformOperator on `/platform` only. Staff are created only via `/employees` (User + Employee together; same-org legacy orphan Users are linked there), no separate org "system account" create flow, no `/join`/`/pending`; org package gate maps `ORG_PACKAGE_NOT_ACTIVATED` / `ORG_PACKAGE_EXPIRED` to package screens/copy.
