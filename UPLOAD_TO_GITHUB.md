# Upload this repository to GitHub

Repository: https://github.com/dotbreaker88/Candlelight

1. Extract `Candlelight-GitHub-Ready-v0.5.1.zip`.
2. Open the extracted `Candlelight` folder.
3. Upload the **contents of that folder** to the root of the GitHub repository (not the outer folder itself).
4. Preserve `.github/workflows/release.yml`.
5. Commit the upload to `main`.

After the commit, the `Build Foundry Release` GitHub Action will:
- validate `system.json`;
- verify all 30 Spirit icons;
- create `candlelight.zip`;
- publish/update the `v0.5.1` GitHub Release;
- attach both `candlelight.zip` and `system.json`.

Then install Candlelight in Foundry using:

https://raw.githubusercontent.com/dotbreaker88/Candlelight/main/system.json

For future updates, increase the `version` in `system.json` before pushing to `main`.
