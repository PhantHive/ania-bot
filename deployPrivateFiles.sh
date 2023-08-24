# Path: deployPrivateFiles.sh
# create a script that should copy every folder and files within "/home/phearion/aniaPrivate/" to current directory/assets

CURRENT_DIR=$(pwd)
cp -a /home/Phearion/aniaPrivate/* $CURRENT_DIR/src/assets
cp -r /home/Phearion/bots/A-Nia/app/.env $CURRENT_DIR/
