<div align="center">
<h6>Self-hosted Favicon Grabber for KeeWeb</h6>
<h2>☁️ KeeWeb Favicon Grabber ☁️</h1>

<br />

<p>

A self-hosted Cloudflare worker for KeeWeb which allows you to run your own favicon grabber service. This worker is responsible for users who obtain a favicon within the KeeWeb application.

</p>

<br />

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/keeweb/keeweb-favicon-worker)

<br />

</div>

<div align="center">

<!-- prettier-ignore-start -->
[![Version][github-version-img]][github-version-uri]
[![Downloads][github-downloads-img]][github-downloads-uri]
[![Build Status][github-build-img]][github-build-uri]
[![Size][github-size-img]][github-size-img]
[![Last Commit][github-commit-img]][github-commit-img]
[![Contributors][contribs-all-img]](#contributors-)
<!-- prettier-ignore-end -->

</div>

<br />

---

<br />

- [About](#about)
- [Service Usage](#service-usage)
- [Self-Hosted Instance](#self-hosted-instance)
  - [Developer Notes](#developer-notes)
    - [wrangler.toml](#wranglertoml)
    - [Global v.s. Local Wrangler Commands](#global-vs-local-wrangler-commands)
  - [Wrangler Commands](#wrangler-commands)
    - [Update Wrangle](#update-wrangle)
    - [Login](#login)
    - [Logout](#logout)
    - [Whoami](#whoami)
    - [Deploy › Dev Server](#deploy--dev-server)
    - [Deploy › Production](#deploy--production)
    - [Deploy › Dry-run (Build)](#deploy--dry-run-build)
    - [Deploy › Rollback](#deploy--rollback)
    - [List Packages](#list-packages)
    - [List Deployments](#list-deployments)
    - [List Versions](#list-versions)
    - [Delete](#delete)
- [Contributors ✨](#contributors-)


<br />

---

<br />

## About

This project is a Cloudflare service worker utilized for [KeeWeb's Favicon Grabber](https://services.keeweb.info/favicon/) and is integrated as an API end-point within the [KeeWeb Password Manager](https://keeweb.info).

<br />

This worker includes the following features:
- Favicon override using a Github repository <sup> _`(self-hostable)`_ </sup>
- Favicon override using locally provided image URL table
- Favicon override using locally provided SVG path
- Works with Google, Yandex, Duckduckgo, FaviconKit, Allesedv
- Site code scanning for favicon tags, both `link` and `svg`
- CORS Security Headers
- Ability to set API rate limits <sup> _`(disabled by default)`_ </sup>
  - Daily limits OR limit X per milliseconds
- Aggressive throttling mode <sup> _`(disabled by default)`_ </sup>
  - Adds an incremental punishment onto the client's cooldown each time they attempt to grab a favicon when their original cooldown period has not yet expired.
- IP blacklisting / banning
- Supports sub-routes for users who want to add on `get`, `post` routes
- Supports Cloudflare worker logs <sup> _`(beta)`_ </sup>

<br />

---

<br />

## Service Usage

Favicons can be grabbed with the following syntax:
```
https://services.keeweb.info/favicon/{DOMAIN}/{ICON_SIZE}
https://services.keeweb.info/favicon/keeweb.info/64
```

<br />

| Parameter | Description | Status |
| --- | --- | --- |
| `DOMAIN` | Website to grab favicon for<br><sub>Does not need `http`, `https` or `www`</sub> | Required |
| `ICON_SIZE` | Size of the icon to return | Optional<br><sub>Default: `32`</sub> |

<br />

---

<br />

## Self-Hosted Instance
If you wish to host your own instance of this service, you must deploy it as a Cloudflare worker, which requires you to sign up for a [Cloudflare account](https://cloudflare.com).

<br />

Once you are signed up for Cloudflare, you may click the button below:

<br />

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/keeweb/keeweb-favicon-worker)

<br />



<br />

### Developer Notes
These are notes you should keep in mind if you plan on modifying this favicon Cloudflare worker.

<br />

#### wrangler.toml
We recommend treating your `wrangler.toml` file as the source of truth for your Worker configuration, and to avoid making changes to your Worker via the Cloudflare dashboard if you are using Wrangler.

If you need to make changes to your Worker from the Cloudflare dashboard, the dashboard will generate a TOML snippet for you to copy into your `wrangler.toml` file, which will help ensure your `wrangler.toml` file is always up to date.

If you change your environment variables in the Cloudflare dashboard, Wrangler will override them the next time you deploy. If you want to disable this behavior, add `keep_vars = true` to your `wrangler.toml`.

If you change your routes in the dashboard, Wrangler will override them in the next deploy with the routes you have set in your `wrangler.toml`. To manage routes via the Cloudflare dashboard only, remove any route and routes keys from your `wrangler.toml` file. Then add `workers_dev = false` to your `wrangler.toml` file. For more information, refer to [Deprecations](https://developers.cloudflare.com/workers/wrangler/deprecations/#other-deprecated-behavior).

Wrangler will not delete your secrets (encrypted environment variables) unless you run `wrangler secret delete <key>`.

<br />

> [!NOTE]
> **Experimental Config**
> 
> Wrangler currently supports an `--experimental-json-config` flag, which will read your configuration from a `wrangler.json` file, rather than `wrangler.toml`. The format of this file is exactly the same as the `wrangler.toml` configuration file, except that the syntax is `JSON` rather than `TOML`. 
> 
> This is experimental, and is not recommended for production use.

<br />

#### Global v.s. Local Wrangler Commands
Since Cloudflare recommends [installing Wrangler locally](https://developers.cloudflare.com/workers/wrangler/install-and-update/) in your project(rather than globally), the way to run Wrangler will depend on your specific setup and package manager.

- [npm](https://developers.cloudflare.com/workers/wrangler/commands/#)
- [yarn](https://developers.cloudflare.com/workers/wrangler/commands/#)
- [pnpm](https://developers.cloudflare.com/workers/wrangler/commands/#)

<br />

After you have access to wrangler globally, you can switch over from using `npx wrangler` to just `wrangler`:

<br />

### Wrangler Commands
This section provides a reference for Wrangler commands. [Full list of commands available here](https://developers.cloudflare.com/workers/wrangler/commands/).

<br />

The syntax for utilizing wrangler is as follows:

```shell ignore
npx wrangler <COMMAND> <SUBCOMMAND> [PARAMETERS] [OPTIONS]
```

<br /> <br />

#### Update Wrangle
Update version of Wrangler used in your project:

```shell ignore
npm install wrangler@latest
```

<br /> <br />

#### Login
To use Wrangler, deploy a dev server, or deploy a production build, you must be signed into your Cloudflare account via wrangler. This will be accomplished by making use of OAuth. Wrangler will attempt to automatically open your web browser to login with your Cloudflare account.

<br />

If you prefer to use API tokens for authentication, such as in headless or continuous integration environments, refer to [Running Wrangler in CI/CD](https://developers.cloudflare.com/workers/wrangler/ci-cd/).

<br />

If Wrangler fails to open a browser, you can copy and paste the URL generated by `wrangler login` in your terminal into a browser and log in.

```shell ignore
npx wrangler login [OPTIONS]
```

<br /> <br />

#### Logout
Logout from Cloudflare

<br />

```shell ignore
npx wrangler logout [OPTIONS]
```

<br /> <br />

#### Whoami
Lists all accounts associated with your Cloudflare account

```shell ignore
npx wrangler whoami
```

<br /> <br />

#### Deploy › Dev Server
Launches local wrangler / cloudflare dev project in a test environment.

```shell ignore
npx wrangler dev -e dev
```

<br /> <br />

#### Deploy › Production
Deploy your Worker to Cloudflare.

```shell ignore
npx wrangler deploy [<SCRIPT>] [OPTIONS]
```

```shell ignore
npx wrangler deploy --minify -e production
```

<br /><br />

#### Deploy › Dry-run (Build)
The following command will build a dry-run compiled version of your index.js file which will be placed in the `dist/` folder

```shell ignore
npx wrangler deploy --dry-run --outdir dist -e production
```

<br />

> [!NOTE]
> None of the options for this command are required. Also, many can be set in your `wrangler.toml` file. Refer to the [`wrangler.toml` configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) documentation for more information.

<br /><br />

#### Deploy › Rollback
Rollback a deployment for a Worker to a previous version.

```shell ignore
npx wrangler rollback [version-id]
```

<br /> <br />

#### List Packages
Check where wrangler (and other global packages) are installed at:

```shell ignore
npm list -g --depth=0
```

<br /><br />

#### List Deployments
Displays the 10 most recent deployments of your Worker

```shell ignore
npx wrangler deployments list
```

<br /><br />

#### List Versions
List the 10 most recent Versions of your Worker [beta]

```shell ignore
npx wrangler versions list
```

<br /> <br />

#### Delete
Delete your Worker and all associated Cloudflare developer platform resources.

```shell ignore
npx wrangler delete [<SCRIPT>] [OPTIONS]
```

<br /><br />

<br />

---

<br />

## Contributors ✨
We are always looking for contributors. If you feel that you can provide something useful to KeeWeb, then we'd love to review your suggestion.

<br />

The following people have helped get this project going:

<br />

<div align="center">

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![Contributors][contribs-all-img]](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://gitlab.com/antelle"><img src="https://avatars.githubusercontent.com/u/633557?v=4?s=40" width="40px;" alt="Antelle"/><br /><sub><b>Antelle</b></sub></a><br /><a href="https://github.com/keeweb/favicon-worker/commits?author=antelle" title="Code">💻</a> <a href="#projectManagement-antelle" title="Project Management">📆</a> <a href="#fundingFinding-antelle" title="Funding Finding">🔍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://gitlab.com/Aetherinox"><img src="https://avatars.githubusercontent.com/u/118329232?v=4?s=40" width="40px;" alt="Aetherinox"/><br /><sub><b>Aetherinox</b></sub></a><br /><a href="https://github.com/keeweb/favicon-worker/commits?author=Aetherinox" title="Code">💻</a> <a href="#projectManagement-Aetherinox" title="Project Management">📆</a> <a href="#fundingFinding-Aetherinox" title="Funding Finding">🔍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://gitlab.com/HarlemSquirrel"><img src="https://avatars.githubusercontent.com/u/6445815?v=4?s=40" width="40px;" alt="HarlemSquirrel"/><br /><sub><b>HarlemSquirrel</b></sub></a><br /><a href="https://github.com/keeweb/favicon-worker/commits?author=HarlemSquirrel" title="Code">💻</a> <a href="#projectManagement-HarlemSquirrel" title="Project Management">📆</a></td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<br />
<br />

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- BADGE > GENERAL -->
  [general-npmjs-uri]: https://npmjs.com
  [general-nodejs-uri]: https://nodejs.org
  [general-npmtrends-uri]: http://npmtrends.com/keeweb-favicon-worker

<!-- BADGE > VERSION > GITHUB -->
  [github-version-img]: https://img.shields.io/github/v/tag/keeweb/keeweb-favicon-worker?logo=GitHub&label=Version&color=ba5225
  [github-version-uri]: https://github.com/keeweb/keeweb-favicon-worker/releases

<!-- BADGE > VERSION > NPMJS -->
  [npm-version-img]: https://img.shields.io/npm/v/keeweb-favicon-worker?logo=npm&label=Version&color=ba5225
  [npm-version-uri]: https://npmjs.com/package/keeweb-favicon-worker

<!-- BADGE > VERSION > PYPI -->
  [pypi-version-img]: https://img.shields.io/pypi/v/keeweb-favicon-worker
  [pypi-version-uri]: https://pypi.org/project/keeweb-favicon-worker

<!-- BADGE > LICENSE > MIT -->
  [license-mit-img]: https://img.shields.io/badge/MIT-FFF?logo=creativecommons&logoColor=FFFFFF&label=License&color=9d29a0
  [license-mit-uri]: https://github.com/keeweb/keeweb-favicon-worker/blob/main/LICENSE

<!-- BADGE > GITHUB > DOWNLOAD COUNT -->
  [github-downloads-img]: https://img.shields.io/github/downloads/keeweb/keeweb-favicon-worker/total?logo=github&logoColor=FFFFFF&label=Downloads&color=376892
  [github-downloads-uri]: https://github.com/keeweb/keeweb-favicon-worker/releases

<!-- BADGE > NPMJS > DOWNLOAD COUNT -->
  [npmjs-downloads-img]: https://img.shields.io/npm/dw/%40keeweb%2Fkeeweb-favicon-worker?logo=npm&&label=Downloads&color=376892
  [npmjs-downloads-uri]: https://npmjs.com/package/keeweb-favicon-worker

<!-- BADGE > GITHUB > DOWNLOAD SIZE -->
  [github-size-img]: https://img.shields.io/github/repo-size/keeweb/keeweb-favicon-worker?logo=github&label=Size&color=59702a
  [github-size-uri]: https://github.com/keeweb/keeweb-favicon-worker/releases

<!-- BADGE > NPMJS > DOWNLOAD SIZE -->
  [npmjs-size-img]: https://img.shields.io/npm/unpacked-size/keeweb-favicon-worker/latest?logo=npm&label=Size&color=59702a
  [npmjs-size-uri]: https://npmjs.com/package/keeweb-favicon-worker

<!-- BADGE > CODECOV > COVERAGE -->
  [codecov-coverage-img]: https://img.shields.io/codecov/c/github/keeweb/keeweb-favicon-worker?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
  [codecov-coverage-uri]: https://codecov.io/github/keeweb/keeweb-favicon-worker

<!-- BADGE > ALL CONTRIBUTORS -->
  [contribs-all-img]: https://img.shields.io/github/all-contributors/keeweb/keeweb-favicon-worker?logo=contributorcovenant&color=de1f6f&label=contributors
  [contribs-all-uri]: https://github.com/all-contributors/all-contributors

<!-- BADGE > GITHUB > BUILD > NPM -->
  [github-build-img]: https://img.shields.io/github/actions/workflow/status/keeweb/keeweb-favicon-worker/worker-publish.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
  [github-build-uri]: https://github.com/keeweb/keeweb-favicon-worker/actions/workflows/worker-publish.yml

<!-- BADGE > GITHUB > BUILD > Pypi -->
  [github-build-pypi-img]: https://img.shields.io/github/actions/workflow/status/keeweb/keeweb-favicon-worker/release-pypi.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
  [github-build-pypi-uri]: https://github.com/keeweb/keeweb-favicon-worker/actions/workflows/pypi-release.yml

<!-- BADGE > GITHUB > TESTS -->
  [github-tests-img]: https://img.shields.io/github/actions/workflow/status/keeweb/keeweb-favicon-worker/tests.yml?logo=github&label=Tests&color=2c6488
  [github-tests-uri]: https://github.com/keeweb/keeweb-favicon-worker/actions/workflows/tests.yml

<!-- BADGE > GITHUB > COMMIT -->
  [github-commit-img]: https://img.shields.io/github/last-commit/keeweb/keeweb-favicon-worker?logo=conventionalcommits&logoColor=FFFFFF&label=Last%20Commit&color=313131
  [github-commit-uri]: https://github.com/keeweb/keeweb-favicon-worker/commits/main/

<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->
