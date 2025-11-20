# Sublime Text Documentation Mirror

This repo tracks the changes in
[Sublime Text documentation](https://www.sublimetext.com/docs/index.html).

The source is automatically fetched daily and if something new is found, it gets
committed automatically. Then I review it and push to this repo manually.

I create git tags for notesworthy commits, so you can subscribe to the
[tags](https://github.com/maliayas/SublimeText_Documentation/tags)

## Update Script

The script that fetches fresh content and updates the git repo is below. The
operation stands on `wget`.

```sh
# Delete existing files.
rm -rf www.sublimetext.com

# Download complete web page.
wget \
    --mirror \
    --no-parent \
    --page-requisites \
    --convert-links \
    --continue \
    --adjust-extension \
    --user-agent="" \
    --execute="robots=off" \
    --wait=1 \
    --append-output="mirror.log" \
    --no-verbose \
    --max-redirect=0 \
    https://www.sublimetext.com/docs/index.html

# Commit if there is something new.
git add .
git commit -m "Update ($(date +%Y-%m-%d))"
```
