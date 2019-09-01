import * as React from 'react';
import { StatefulEvent, Releaseable } from 'mo-core';
import * as ios from './ios';
import * as android from './android';
export declare enum InterfaceOrientation {
    PORTRAIT = "portrait",
    LANDSCAPELEFT = "landscapeLeft",
    LANDSCAPERIGHT = "landscapeRight"
}
export declare type AllowedOrientations = Set<InterfaceOrientation>;
/**
 * any direction
 */
export declare const AllowedOrientationsAny: AllowedOrientations;
/**
 * portrait only
 */
export declare const AllowedOrientationsPortrait: AllowedOrientations;
/**
 * landscape only
 */
export declare const AllowedOrientationsLandscape: AllowedOrientations;
export declare class Orientation {
    static readonly ios: typeof ios;
    static readonly android: typeof android;
    /**
     * stateful event that provides the current interface orientation
     */
    static readonly interfaceOrientation: StatefulEvent<InterfaceOrientation>;
    /**
     * set the allowed orientations globally
     */
    static setAllowedOrientations(orientations: AllowedOrientations): void;
    private static allowedOrientationsStack;
    /**
     * lock the allowed orientations to orientations until lock is released
     * pushAllowedOrientations(...).release()
     */
    static pushAllowedOrientations(orientations: AllowedOrientations): Releaseable;
}
export interface OrientationConsumerProps {
    children: (orientation: InterfaceOrientation) => React.ReactElement;
}
/**
 * consume the current orientation. takes a function as child that gets passed
 * the current orientation.
 */
export declare class OrientationConsumer extends React.PureComponent<OrientationConsumerProps, {
    orientation: InterfaceOrientation;
}> {
    state: {
        orientation: InterfaceOrientation;
    };
    private subscription?;
    constructor(props: OrientationConsumerProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
export interface OrientationInjectedProps {
    orientation: Orientation;
}
export declare function withOrientation<Props extends OrientationInjectedProps>(component: React.ComponentType<Props>): (React.ComponentType<Omit<Props, keyof OrientationInjectedProps>>);
export declare function withOrientationDecorator<Props extends OrientationInjectedProps, ComponentType extends React.ComponentType<Props>>(component: ComponentType & React.ComponentType<Props>): (ComponentType & (new (props: Omit<Props, keyof OrientationInjectedProps>, context?: any) => React.Component<Omit<Props, keyof OrientationInjectedProps>>));
/**
 * lock the orientation to allowed as long as this component is mounted
 */
export declare class OrientationLock extends React.PureComponent<{
    /**
     * the allowed orientation, any of AllowedOrientations or an array of those.
     */
    allowed: 'landscape' | 'any' | InterfaceOrientation | InterfaceOrientation[];
    children?: never;
}> {
    private lock?;
    private resolveAllowed;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: OrientationLock['props']): void;
    render(): null;
}
