import * as React from 'react';
export declare type Orientation = 'portrait' | 'landscapeLeft' | 'landscapeRight';
export declare type AllowedOrientations = Set<Orientation>;
export declare const AllowedOrientationsAny: AllowedOrientations;
export declare const AllowedOrientationsPortrait: AllowedOrientations;
export declare const AllowedOrientationsLandscape: AllowedOrientations;
export declare class OrientationTools {
    private static getInitialOrientation;
    static readonly interfaceOrientation: any;
    private static interfaceOrientationSubscription?;
    private static interfaceOrientationSubscribe;
    static setAllowedOrientations(orientations: AllowedOrientations): void;
    private static allowedOrientationsStack;
    static pushAllowedOrientations(orientations: AllowedOrientations): {
        remove: () => void;
    };
}
export declare const OrientationConsumer: any;
export interface OrientationInjectedProps {
    orientation: Orientation;
}
export declare const withOrientation: any;
export declare class OrientationLock extends React.PureComponent<{
    allowed: AllowedOrientations | 'portrait' | 'landscape' | 'any' | Orientation[];
}> {
    private lock;
    private resolveAllowed;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: OrientationLock['props']): void;
    render(): null;
}
