# !/bin/bash

cd src

index=$(<views/index.html)
default=$(<views/404.html)

echo -e "pub static DEFAULT_PAGE_HTML: &str = r#\"\n$default\n\"#;\n\npub static HTML_STR: &str = r#\"\n$index\n\"#;" > html.rs