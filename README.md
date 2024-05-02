<div align="center">
<h1>KeeWeb Favicon Cloudflare Worker ☁️</h1>
<br />
<p>

A Cloudflare worker utilized for [KeeWeb's](https://github.com/keeweb/keeweb) favicon grabber.

</p>

<br />

<!-- prettier-ignore-start -->
[![Code Coverage][badge-coverage]][link-coverage]
[![Last Commit][badge-commit]][badge-commit]
[![Size][badge-size]][badge-size]
[![All Contributors][all-contributors-badge]](#contributors-)
<!-- prettier-ignore-end -->

</div>

---

<br />

- [About](#about)
- [Service Usage](#service-usage)
- [Contributors ✨](#contributors-)


<br />

---

<br />

## About

This project is a Cloudflare service worker utilized for [KeeWeb's Favicon Grabber](https://services.keeweb.info/favicon/keeweb.info). 

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

## Contributors ✨
We are always looking for contributors. If you feel that you can provide something useful to KeeWeb, then we'd love to review your suggestion.

<br />

The following people have helped get this project going:

<div align="center">

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
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
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

</div>

<br />

---

<br />

<!-- prettier-ignore-start -->
[link-npm]: https://npmjs.com
[link-node]: https://nodejs.org
[link-npmtrends]: http://npmtrends.com/keeweb
[link-license]: https://github.com/keeweb/favicon-worker/blob/master/LICENSE
[link-package]: https://npmjs.com/package/keeweb/favicon-worker
[link-coverage]: https://codecov.io/github/keeweb/favicon-worker
[link-build]: https://github.com/keeweb/favicon-worker/actions/workflows/build.yaml?query=workflow%3Abuild.yml
[link-tests]: https://github.com/keeweb/favicon-worker/actions/workflows/tests.yaml?query=workflow%3Atests.yml

[badge-commit]: https://img.shields.io/github/last-commit/keeweb/favicon-worker?color=b43bcc
[badge-size]: https://img.shields.io/github/repo-size/keeweb/favicon-worker?label=size&color=59702a
[badge-build]: https://img.shields.io/github/actions/workflow/status/keeweb/favicon-worker/build.yml?logo=github&label=Build&color=%23278b30
[badge-tests]: https://img.shields.io/github/actions/workflow/status/keeweb/favicon-worker/tests.yml?logo=github&label=Tests&color=%23278b30
[badge-coverage]: https://img.shields.io/codecov/c/github/keeweb/favicon-worker?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
[badge-version]: https://img.shields.io/npm/v/keeweb//favicon-worker
[badge-downloads]: https://img.shields.io/npm/dm/keeweb.svg
[badge-license]: https://img.shields.io/npm/l/keeweb.svg
[all-contributors]: https://github.com/all-contributors/all-contributors
[all-contributors-badge]: https://img.shields.io/github/all-contributors/keeweb/favicon-worker?color=de1f6f&label=contributors
<!-- prettier-ignore-end -->
