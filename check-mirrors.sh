#!/bin/bash
pushd content/packages > /dev/null

check_package() {
	echo -en "\033[0mTesting ${1}..."
	if [ "$(curl -sSL ${1} | openssl sha1 -binary | xxd -p)" == "${2}" ]; then
		echo -e " [\033[32m\033[1mPASS\033[0m]"
	else
		echo -e " [\033[31m\033[1mFAIL\033[0m]"
	fi
}

for URL in $(cat ra-quickinstall-mirrors.txt); do check_package "${URL}" "44241f68e69db9511db82cf83c174737ccda300b"; done
for URL in $(cat ra-base-mirrors.txt); do check_package "${URL}" "aa022b208a3b45b4a45c00fdae22ccf3c6de3e5c"; done
for URL in $(cat ra-aftermath-mirrors.txt); do check_package "${URL}" "d511d4363b485e11c63eecf96d4365d42ec4ef5e"; done
for URL in $(cat ra-cncdesert-mirrors.txt); do check_package "${URL}" "039849f16e39e4722e8c838a393c8a0d6529fd59"; done
for URL in $(cat ra-scores-mirrors.txt); do check_package "${URL}" "134200e10b6e85b2d9bd4f0fe370ab57b75d1563"; done

for URL in $(cat cnc-mirrors.txt); do check_package "${URL}" "72f337464963fa37d3688eb03e80eefd33669a3d"; done
for URL in $(cat cnc-music-mirrors.txt); do check_package "${URL}" "c7f220aa59024f02932d5713b1aa6201113c03b5"; done

for URL in $(cat d2k-base-mirrors.txt); do check_package "${URL}" "82221691fe843a5a245969095f147e929c364234"; done
for URL in $(cat d2k-quickinstall-mirrors.txt); do check_package "${URL}" "eb9ff88ca24858bd06a752f923156a6480c25c06"; done
for URL in $(cat d2k-patch106-mirrors.txt); do check_package "${URL}" "90924e5254468ec79c71e456384f5895a6c84bae"; done

for URL in $(cat ts-mirrors.txt); do check_package "${URL}" "824df30de0004ad13fac29cf16450caafee9fb1b"; done
for URL in $(cat ts-music-mirrors.txt); do check_package "${URL}" "f445cf47ffa343d9e211ec31f29fb45c8aefac80"; done
for URL in $(cat fs-mirrors.txt); do check_package "${URL}" "8bff90870a9348b72cbe91314aec7d3a50311aa9"; done
for URL in $(cat ts-quickinstall-mirrors.txt); do check_package "${URL}" "d9339e7b6ecf624ac6ca91d25c58b88fb88a49d2"; done

popd > /dev/null