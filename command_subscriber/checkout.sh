git init
git config core.sparsecheckout true
git remote add origin https://github.com/clicube/mosho.git
echo command_subscriber > .git/info/sparse-checkout
git pull origin master
