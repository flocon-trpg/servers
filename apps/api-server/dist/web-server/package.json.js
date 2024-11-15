'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var name = "@flocon-trpg/web-server";
var version = "0.9.0-rc.6";
var type = "module";
var scripts = {
	dev: "vite",
	build: "run-s build:deps build:self",
	"build:deps": "yarn workspaces foreach --recursive -pt --from '@flocon-trpg/web-server' --exclude '@flocon-trpg/web-server' run build",
	"build:self": "tsc -b && vite build",
	lint: "eslint .",
	preview: "vite preview",
	storybook: "storybook dev -p 6006",
	test: "vitest",
	"test-ci": "vitest --coverage",
	prettier: "yarn prettier:base --write --cache",
	"prettier-check": "yarn prettier:base --check",
	"prettier:base": "prettier \"**/*.{ts,tsx,js,json,yml,md,graphql}\"",
	"build-storybook": "storybook build"
};
var eslintConfig = {
	"extends": [
		"plugin:storybook/recommended"
	]
};
var dependencies = {
	"@emotion/react": "^11.4.1",
	"@emotion/styled": "^11.9.3",
	"@flocon-trpg/core": "workspace:^",
	"@flocon-trpg/sdk": "workspace:^",
	"@flocon-trpg/sdk-react": "workspace:^",
	"@flocon-trpg/sdk-urql": "workspace:^",
	"@flocon-trpg/typed-document-node": "workspace:^",
	"@flocon-trpg/utils": "workspace:^",
	"@hello-pangea/color-picker": "^3.2.2",
	"@kizahasi/option": "^1.1.0",
	"@kizahasi/ot-string": "0.7.0",
	"@kizahasi/result": "^1.1.0",
	"@monaco-editor/react": "^4.2.2",
	"@react-spring/konva": "^9.2.4",
	"@react-spring/web": "^9.0.0",
	"@tanstack/react-query": "^5.59.0",
	"@tanstack/react-router": "^1.69.1",
	"@tanstack/router-devtools": "^1.76.1",
	antd: "^5.0.0",
	classnames: "^2.3.1",
	"clipboard-copy": "^4.0.1",
	dayjs: "^1.11.7",
	"es-toolkit": "^1.25.2",
	firebase: "^10.0.0",
	graphql: "^15.6.0",
	"graphql-ws": "^5.8.1",
	howler: "^2.2.3",
	"html-escaper": "^3.0.3",
	immer: "^10.0.0",
	jdenticon: "^3.1.1",
	jotai: "^2.0.0",
	"js-file-download": "^0.4.12",
	jszip: "^3.9.1",
	konva: "^8.3.9",
	"linkify-react": "^4.0.2",
	linkifyjs: "^4.1.3",
	localforage: "^1.10.0",
	moment: "^2.29.1",
	pino: "^9.4.0",
	"re-resizable": "^6.9.1",
	react: "^18.3.1",
	"react-dnd": "^16.0.0",
	"react-dnd-html5-backend": "^16.0.0",
	"react-dom": "^18.3.1",
	"react-draggable": "^4.4.4",
	"react-konva": "^18.1.1",
	"react-markdown": "^8.0.0",
	"react-rnd": "^10.3.7",
	"react-use": "^17.3.1",
	"react-virtuoso": "^4.0.0",
	rxjs: "^7.5.6",
	sucrase: "^3.20.1",
	typescript: "5.6.2",
	"url-join": "^4.0.1",
	urql: "^4.1.0",
	"use-constant": "^1.1.0",
	"use-image": "1.1.1",
	"use-memo-one": "^1.1.2",
	zod: "^3.19.1"
};
var devDependencies = {
	"@chromatic-com/storybook": "3.2.2",
	"@eslint/js": "9.14.0",
	"@flocon-trpg/eslint-config": "workspace:^",
	"@flocon-trpg/prettier-config": "workspace:^",
	"@storybook/addon-essentials": "8.4.2",
	"@storybook/addon-interactions": "8.4.2",
	"@storybook/addon-links": "8.4.2",
	"@storybook/addon-onboarding": "8.4.2",
	"@storybook/blocks": "8.4.2",
	"@storybook/react": "8.4.2",
	"@storybook/react-vite": "8.4.2",
	"@storybook/test": "8.4.2",
	"@tanstack/router-plugin": "1.79.0",
	"@testing-library/dom": "10.4.0",
	"@testing-library/react": "16.0.1",
	"@types/color": "3.0.6",
	"@types/color-name": "1.1.5",
	"@types/howler": "2.2.12",
	"@types/html-escaper": "3.0.2",
	"@types/react": "18.3.12",
	"@types/react-color": "3.0.12",
	"@types/react-dom": "18.3.1",
	"@types/react-linkify": "1.0.4",
	"@types/sinonjs__fake-timers": "8.1.5",
	"@types/url-join": "4.0.3",
	"@urql/core": "5.0.8",
	"@urql/devtools": "2.0.3",
	"@vitejs/plugin-react-swc": "3.7.1",
	"@vitest/coverage-v8": "2.1.4",
	chromatic: "11.17.0",
	color: "4.2.3",
	"color-name": "1.1.4",
	dotenv: "16.4.5",
	eslint: "9.14.0",
	"eslint-config-prettier": "9.1.0",
	"eslint-plugin-react-hooks": "5.1.0-rc-fb9a90fa48-20240614",
	"eslint-plugin-react-refresh": "0.4.14",
	"eslint-plugin-storybook": "0.11.0",
	globals: "15.12.0",
	less: "4.2.0",
	"monaco-editor": "0.52.0",
	"npm-run-all2": "7.0.1",
	prettier: "3.3.3",
	rollup: "4.24.4",
	"rollup-plugin-license": "3.5.3",
	"sass-embedded": "1.80.6",
	storybook: "8.4.2",
	typescript: "5.6.3",
	"typescript-eslint": "8.13.0",
	vite: "5.4.10",
	"vite-tsconfig-paths": "5.1.0",
	vitest: "2.1.4"
};
var WebPackageJson = {
	name: name,
	version: version,
	"private": true,
	type: type,
	scripts: scripts,
	eslintConfig: eslintConfig,
	dependencies: dependencies,
	devDependencies: devDependencies
};

exports.default = WebPackageJson;
exports.dependencies = dependencies;
exports.devDependencies = devDependencies;
exports.eslintConfig = eslintConfig;
exports.name = name;
exports.scripts = scripts;
exports.type = type;
exports.version = version;
//# sourceMappingURL=package.json.js.map