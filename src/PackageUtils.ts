import { PullRequestType, VersionTag } from './Types';

export default class PackageUtils {
    // Default types from https://www.conventionalcommits.org/en/v1.0.0/ + extras
    public static patches = [
        'build',
        'chore',
        'ci',
        'cd',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'fix'
    ];

    public static minors = [
        "feat"
    ];

    public static majors: string[] = [];

    /**
     * Get the type of update from a pull request title
     * @param title The pull request title, it must follow the Conventional Commits specification
     */
    public static getPullRequestTypeFromTitle(title: string): PullRequestType {
        const type = title.split(':')[0];
        if (type.includes('!') || PackageUtils.majors.includes(type)) {
            return PullRequestType.MAJOR;
        }
        if (PackageUtils.minors.find(minor => type.startsWith(minor))) {
            return PullRequestType.MINOR;
        }
        return PullRequestType.PATCH;
    }

    /**
     * Return an incremented version from a pull request type (patch, minor, major)
     * @param packageVersion The package json version, only semver versions are supported
     * @param pullRequestType The pull request type, one of patch, minor or major
     */
    public static getIncrementedVersionNumber(
        packageVersion: string,
        pullRequestType: PullRequestType
    ): string {
        const versions = packageVersion
            .split('.')
            .map((version) => Number.parseInt(version, 10));

        switch (pullRequestType) {
            case PullRequestType.MAJOR:
                return `${versions[0] + 1}.0.0`;
            case PullRequestType.MINOR:
                return `${versions[0]}.${versions[1] + 1}.0`;
            case PullRequestType.PATCH:
                return `${versions[0]}.${versions[1]}.${versions[2] + 1}`;
            default:
                return packageVersion;
        }
    }

    public static getVersionTag(source: string): string {
        switch (source) {
            case 'master':
                return VersionTag.STABLE;
            case 'main':
                return VersionTag.STABLE;
            default:
                return VersionTag.CANARY;
        }
    };
}
