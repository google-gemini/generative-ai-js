# How to Contribute

We would love to accept your patches and contributions to this project.

## Before you begin

### Sign our Contributor License Agreement

Contributions to this project must be accompanied by a
[Contributor License Agreement](https://cla.developers.google.com/about) (CLA).
You (or your employer) retain the copyright to your contribution; this simply
gives us permission to use and redistribute your contributions as part of the
project.

If you or your current employer have already signed the Google CLA (even if it
was for a different project), you probably don't need to do it again.

Visit <https://cla.developers.google.com/> to see your current agreements or to
sign a new one.

### Review our Community Guidelines

This project follows [Google's Open Source Community
Guidelines](https://opensource.google/conduct/).

## Contribution process

### Building and testing locally

Steps to build locally:

1. clone this repo
1. `cd generative-ai-js`
1. Run `yarn` to install dependencies.
1. Make changes as needed to source code.
1. Run `yarn build` to build.
1. Run `yarn test` to run unit tests.
1. Run `yarn docs` to generate any changes to reference docs (destination dir is docs/reference).
1. Run `yarn format` to fix formatting and add license headers as needed.

This repo has a monorepo structure to allow for easily adding additional packages. The `@google/generative-ai` package code is in `packages/main`.

### Code Reviews

All submissions, including submissions by project members, require review. We
use [GitHub pull requests](https://docs.github.com/articles/about-pull-requests)
for this purpose.