export const POSITION_INCREMENT = 1000;

export const calculateNewPosition = (
    beforePosition?: string | null,
    afterPosition?: string | null
): string => {
    if (beforePosition === null && afterPosition === null) {
        // No lists exist, assign initial position
        return POSITION_INCREMENT.toString();
    }
    if (beforePosition === null && afterPosition) {
        return (Number(afterPosition) / 2).toString();
    }
    if (beforePosition && afterPosition === null) {
        return (Number(beforePosition) + POSITION_INCREMENT).toString();
    }
    if (beforePosition && afterPosition) {
        return ((Number(beforePosition) + Number(afterPosition)) / 2).toString();
    }
    return POSITION_INCREMENT.toString();
}