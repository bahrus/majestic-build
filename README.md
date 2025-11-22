# majestic-build

Generate *.html and *.json from *.mjs

Searches for all *.mjs files outside the node_modules folder
Checks if each *.mjs file has an export function called render().
If so, invokes that function.
If the function returns a string that starts with a "<" characters, (over)write to a file with the same file name but with extension ".html" instead of ".mjs".
If the function returns a string that starts with either a "[" or a "{" character, (over)write to a file with the same file name but with extension ".json" instead of ".mjs"

Generated from [Claude AI](https://claude.ai/public/artifacts/6526e396-690a-4a5a-8bb5-49c0b6c0358d)
