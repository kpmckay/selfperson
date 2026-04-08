---
date: 2026-04-08
title: "NVMe Boot Drive Protection"
summary: "When you frequently work with NVMe devices, it's easy to move too fast and accidentally target the wrong device with a destructive operation. I've formatted a few boot drives during testing, resulting in the need to reinstall an OS and losing any unsaved work. It's awful. In the back of my mind I always had the idea that I should just put something in my bashrc that could prevent this, but never found the time to work on it. With AI tools, this task became trivial and covered a lot more edge cases than I probably would have bothered with. It took a few iterations to get it right and I did the testing myself on my dev system, but in less than an hour, the solution was in hand. The Gist link is below."
link: "https://gist.github.com/kpmckay/dbc019a9c6af583686c2522aaf83e137"
linkText: "Bash script to prevent destructive operations to an NVMe boot drive with nvme-cli."
tag: "Code"
---
