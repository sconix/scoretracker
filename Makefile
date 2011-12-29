APP_ID = org.e.lnx.wee.scoretracker

APP_DIR = /usr/palm/applications/$(APP_ID)

PKG_DIR = /usr/palm/packages/$(APP_ID)

all: clean
	@mkdir -p ./build/$(APP_DIR)
	@mkdir -p ./build/$(PKG_DIR)
	@cp -a mojo-app/* ./build/$(APP_DIR)/
	@cp -a package/* ./build/$(PKG_DIR)/
	@wosi-package -p ./build

install: all
	palm-install ${APP_ID}_*.ipk
	palm-launch ${APP_ID}

clean:
	@rm -rf ./build
	@mkdir ./build
	@echo "*" >./build/.gitignore
