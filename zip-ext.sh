# Zip the extension so that it can be uploaded to web store.
cd ext
rm -f ../../js2at.zip
zip -r ../../js2at.zip --exclude=*.DS_Store* .
