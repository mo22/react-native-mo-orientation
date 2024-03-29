import * as React from 'react';
import { StatefulEvent, Releaseable } from 'mo-core';
import * as ios from './ios';
import * as android from './android';
export declare enum InterfaceOrientation {
    /**
     * standard portrait
     */
    PORTRAIT = "portrait",
    /**
     * rotated 90 ccw
     */
    LANDSCAPELEFT = "landscapeLeft",
    /**
     * rotated 90 clockwise
     */
    LANDSCAPERIGHT = "landscapeRight"
}
export type AllowedOrientations = Set<InterfaceOrientation>;
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
    /**
     * native ios functions. use with caution
     */
    static readonly ios: typeof ios;
    /**
     * native android functions. use with caution
     */
    static readonly android: typeof android;
    /**
     * be verbose
     */
    static setVerbose(verbose: boolean): void;
    private static verbose;
    /**
     * stateful event that provides the current interface orientation
     */
    static readonly interfaceOrientation: StatefulEvent<InterfaceOrientation>;
    /**
     * set the allowed orientations globally
     * undefined means not to interfere with the default
     */
    static setAllowedOrientations(orientations: AllowedOrientations | undefined): void;
    private static allowedOrientationsStack;
    /**
     * lock the allowed orientations to orientations until lock is released
     * pushAllowedOrientations(...).release()
     */
    static pushAllowedOrientations(orientations: AllowedOrientations): Releaseable;
}
/**
 * consume the current orientation. takes a function as child that gets passed
 * the current orientation.
 */
export interface OrientationConsumerProps {
    children: (orientation: InterfaceOrientation) => React.ReactElement;
}
export declare function OrientationConsumer(props: OrientationConsumerProps): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
export interface OrientationInjectedProps {
    orientation: InterfaceOrientation;
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
    allowed: 'portrait' | 'landscape' | 'any' | AllowedOrientations;
    children?: never;
}> {
    private lock?;
    private resolveAllowed;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: OrientationLock['props']): void;
    render(): null;
}
