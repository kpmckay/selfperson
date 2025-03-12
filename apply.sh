#!/bin/bash

if [ -f ./.gitconfig ]; then
   cp ./.gitconfig ~/
   echo "[OK] Copied .gitconfig"
else
   echo "Warning: Did not copy .gitconfig to ~/"
fi

if [ ! -d ~/.bash_extensions ]; then
   mkdir ~/.bash_extensions
   echo "[OK] Created ~/.bash_extensions folder"
   if [ -f ./bash_extensions/lsnvme ]; then
      cp ./bash_extensions/lsnvme ~/.bash_extensions/lsnvme
      echo "[OK] Added lsnvme to ~/.bash_extensions folder"
   else
      echo "[Warning] Did not add lsnvme"
   fi
fi

if [ -f ./.vimrc ]; then
   cp ./.vimrc ~/
   echo "[OK] Copied .vimrc"
else
   echo "Warning: Did not copy .vimrc to ~/"
fi

if [ -f ./.bashrc_kpmckay ]; then
   cat ./.bashrc_kpmckay >> ~/.bashrc
   source ~/.bashrc
   echo "[OK] Appended and sourced ~/.bashrc"
else
   echo "[WARNING] Did not modify and source ~/.bashrc"
fi
