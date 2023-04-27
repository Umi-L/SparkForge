let runningCount = 0;

export function genUUID() {
    return runningCount++;
}