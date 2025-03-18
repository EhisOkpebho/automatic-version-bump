export const VersionPattern = {
    VERSION_NUMBER: /^\d+(\.\d+)*(?=[- ])/,
    TAG: /-\w+$/
}

export enum PullRequestType {
    PATCH,
    MINOR,
    MAJOR,
}

export enum VersionTag {
    STABLE = 'stable',
    CANARY = 'canary'
}
