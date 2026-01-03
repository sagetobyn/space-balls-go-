const { withAndroidManifest, withAppBuildGradle, withDangerousMod, withMainApplication } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin for Google Play Games Services auto sign-in
 * Configures:
 * 1. AndroidManifest.xml with APP_ID meta-data
 * 2. build.gradle with Play Games SDK dependency
 * 3. strings.xml with project ID
 * 4. MainApplication.kt with SDK initialization
 */

function withPlayGamesManifest(config, { projectId }) {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults.manifest;

        if (!manifest.application) {
            manifest.application = [{}];
        }

        const application = manifest.application[0];

        if (!application['meta-data']) {
            application['meta-data'] = [];
        }

        // Add Play Games APP_ID
        const hasAppId = application['meta-data'].some(
            (item) => item.$?.['android:name'] === 'com.google.android.gms.games.APP_ID'
        );
        if (!hasAppId) {
            application['meta-data'].push({
                $: {
                    'android:name': 'com.google.android.gms.games.APP_ID',
                    'android:value': `@string/game_services_project_id`,
                },
            });
        }

        return config;
    });
}

function withPlayGamesBuildGradle(config) {
    return withAppBuildGradle(config, async (config) => {
        let buildGradle = config.modResults.contents;

        if (!buildGradle.includes('play-services-games-v2')) {
            buildGradle = buildGradle.replace(
                /dependencies\s*\{/,
                `dependencies {\n    implementation 'com.google.android.gms:play-services-games-v2:20.1.2'`
            );
            config.modResults.contents = buildGradle;
        }

        return config;
    });
}

function withPlayGamesStrings(config, { projectId }) {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const stringsPath = path.join(
                config.modRequest.platformProjectRoot,
                'app/src/main/res/values/strings.xml'
            );

            if (fs.existsSync(stringsPath)) {
                let content = fs.readFileSync(stringsPath, 'utf-8');

                if (!content.includes('game_services_project_id')) {
                    content = content.replace(
                        '</resources>',
                        `    <string name="game_services_project_id">${projectId}</string>\n</resources>`
                    );
                    fs.writeFileSync(stringsPath, content);
                }
            }

            return config;
        },
    ]);
}

function withPlayGamesMainApplication(config) {
    return withMainApplication(config, async (config) => {
        let content = config.modResults.contents;

        // Add import for PlayGamesSdk if not present
        if (!content.includes('com.google.android.gms.games.PlayGamesSdk')) {
            // Add import after the package declaration
            content = content.replace(
                /(package\s+[\w.]+)/,
                '$1\n\nimport com.google.android.gms.games.PlayGamesSdk'
            );
        }

        // Add initialization in onCreate if not present
        if (!content.includes('PlayGamesSdk.initialize')) {
            // Find onCreate and add initialization after super.onCreate()
            content = content.replace(
                /super\.onCreate\(\)/,
                'super.onCreate()\n        PlayGamesSdk.initialize(this)'
            );
        }

        config.modResults.contents = content;
        return config;
    });
}

const withPlayGames = (config, props = {}) => {
    const { projectId = '' } = props;

    if (!projectId) {
        console.warn('[withPlayGames] No projectId provided');
    }

    config = withPlayGamesManifest(config, { projectId });
    config = withPlayGamesBuildGradle(config);
    config = withPlayGamesStrings(config, { projectId });
    config = withPlayGamesMainApplication(config);

    return config;
};

module.exports = withPlayGames;
