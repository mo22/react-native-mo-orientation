import * as React from 'react';
import { StatefulEvent, Releaseable } from 'mo-core';
import * as ios from './ios';
import * as android from './android';
import { Dimensions, ScaledSize } from 'react-native';

export enum InterfaceOrientation {
  /**
   * standard portrait
   */
  PORTRAIT = 'portrait',
  /**
   * rotated 90 ccw
   */
  LANDSCAPELEFT = 'landscapeLeft',
  /**
   * rotated 90 clockwise
   */
  LANDSCAPERIGHT = 'landscapeRight',
}

export type AllowedOrientations = Set<InterfaceOrientation>;

/**
 * any direction
 */
export const AllowedOrientationsAny: AllowedOrientations = new Set<InterfaceOrientation>([
  InterfaceOrientation.PORTRAIT, InterfaceOrientation.LANDSCAPELEFT, InterfaceOrientation.LANDSCAPERIGHT,
]);

/**
 * portrait only
 */
export const AllowedOrientationsPortrait: AllowedOrientations = new Set<InterfaceOrientation>([
  InterfaceOrientation.PORTRAIT,
]);

/**
 * landscape only
 */
export const AllowedOrientationsLandscape: AllowedOrientations = new Set<InterfaceOrientation>([
  InterfaceOrientation.LANDSCAPELEFT, InterfaceOrientation.LANDSCAPERIGHT,
]);



const iosOrientationMap: { [k: number]: InterfaceOrientation } = {
  [ios.Orientation.Portrait]: InterfaceOrientation.PORTRAIT,
  [ios.Orientation.PortraitUpsideDown]: InterfaceOrientation.PORTRAIT,
  [ios.Orientation.LandscapeLeft]: InterfaceOrientation.LANDSCAPELEFT,
  [ios.Orientation.LandscapeRight]: InterfaceOrientation.LANDSCAPERIGHT,
};

const androidOrientationMap: { [k: number]: InterfaceOrientation } = {
  [android.Orientation.Portrait]: InterfaceOrientation.PORTRAIT,
  [android.Orientation.LandscapeLeft]: InterfaceOrientation.LANDSCAPELEFT,
  [android.Orientation.LandscapeRight]: InterfaceOrientation.LANDSCAPERIGHT,
};



export class Orientation {
  /**
   * native ios functions. use with caution
   */
  public static readonly ios = ios;

  /**
   * native android functions. use with caution
   */
  public static readonly android = android;

  /**
   * stateful event that provides the current interface orientation
   */
  public static readonly interfaceOrientation = new StatefulEvent<InterfaceOrientation>(
    (() => {
      if (ios.Module && ios.Module.initialOrientation) {
        return iosOrientationMap[ios.Module.initialOrientation.interfaceOrientation];
      }
      if (android.Module) {
        android.Module.getOrientation().then((val) => {
          if (val) Orientation.interfaceOrientation.value = androidOrientationMap[val];
        });
      }
      const d = Dimensions.get('window');
      return (d.height > d.width) ? InterfaceOrientation.PORTRAIT : InterfaceOrientation.LANDSCAPELEFT;
    })(),
    (emit) => {
      if (ios.Events && ios.Module) {
        let cur: number|undefined;
        const sub = ios.Events.addListener('ReactNativeMoOrientation', (rs) => {
          if (rs.interfaceOrientation === cur) return;
          cur = rs.interfaceOrientation;
          emit(iosOrientationMap[rs.interfaceOrientation]);
        });
        ios.Module.enableOrientationEvent(true);
        return () => {
          sub.remove();
          ios.Module!.enableOrientationEvent(false);
        };
      } else if (android.Events && android.Module) {
        let cur: number|undefined;
        const sub = android.Events.addListener('ReactNativeMoOrientation', (rs) => {
          // rotation vs orientation?
          if (rs.rotation === cur) return;
          cur = rs.rotation;
          emit(androidOrientationMap[rs.rotation]);
        });
        android.Module.enableOrientationEvent(true);
        return () => {
          sub.remove();
          android.Module!.enableOrientationEvent(false);
        };
      } else {
        let cur: InterfaceOrientation|undefined;
        const handler = ({ window }: { window: ScaledSize }) => {
          const orientation = (window.height > window.width) ? InterfaceOrientation.PORTRAIT : InterfaceOrientation.LANDSCAPELEFT;
          if (orientation === cur) return;
          cur = orientation;
          emit(orientation);
        };
        Dimensions.addEventListener('change', handler);
        return () => {
          Dimensions.removeEventListener('change', handler);
        };
      }
    }
  );

  /**
   * set the allowed orientations globally
   */
  public static setAllowedOrientations(orientations: AllowedOrientations) {
    if (ios.Module) {
      ios.Module.setOrientationMask(
        (orientations.has(InterfaceOrientation.PORTRAIT) ? ios.OrientationMask.Portrait : 0) +
        (orientations.has(InterfaceOrientation.LANDSCAPELEFT) ? ios.OrientationMask.LandscapeLeft : 0) +
        (orientations.has(InterfaceOrientation.LANDSCAPERIGHT) ? ios.OrientationMask.LandscapeRight : 0)
      );
      if (!orientations.has(this.interfaceOrientation.value)) {
        if (orientations.has(InterfaceOrientation.PORTRAIT)) {
          ios.Module.setOrientation(ios.Orientation.Portrait);
        } else if (orientations.has(InterfaceOrientation.LANDSCAPELEFT)) {
          ios.Module.setOrientation(ios.Orientation.LandscapeLeft);
        } else if (orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
          ios.Module.setOrientation(ios.Orientation.LandscapeRight);
        }
      }
    } else if (android.Module) {
      if (orientations.has(InterfaceOrientation.PORTRAIT) && orientations.has(InterfaceOrientation.LANDSCAPELEFT) && orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
        android.Module.setRequestedOrientation(android.RequestOrientation.Sensor);
      } else if (orientations.has(InterfaceOrientation.LANDSCAPELEFT) && orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
        android.Module.setRequestedOrientation(android.RequestOrientation.SensorLandscape);
      } else if (orientations.has(InterfaceOrientation.PORTRAIT)) {
        if (__DEV__ && orientations.size !== 1) {
          console.warn('Orientation.setAllowedOrientations: android does not support mixing portrait with only one landscape mode');
        }
        android.Module.setRequestedOrientation(android.RequestOrientation.Portrait);
      } else if (orientations.has(InterfaceOrientation.LANDSCAPELEFT)) {
        android.Module.setRequestedOrientation(android.RequestOrientation.ReverseLandscape);
      } else if (orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
        android.Module.setRequestedOrientation(android.RequestOrientation.Landscape);
      }
    }
  }

  private static allowedOrientationsStack: AllowedOrientations[] = [];

  /**
   * lock the allowed orientations to orientations until lock is released
   * pushAllowedOrientations(...).release()
   */
  public static pushAllowedOrientations(orientations: AllowedOrientations): Releaseable {
    this.allowedOrientationsStack.push(orientations);
    this.setAllowedOrientations(orientations);
    return {
      release: () => {
        this.allowedOrientationsStack = this.allowedOrientationsStack.filter((i) => i !== orientations);
        this.setAllowedOrientations(this.allowedOrientationsStack.length ? this.allowedOrientationsStack.slice(-1)[0] : AllowedOrientationsPortrait);
      },
    };
  }

}



export interface OrientationConsumerProps {
  children: (orientation: InterfaceOrientation) => React.ReactElement;
}

/**
 * consume the current orientation. takes a function as child that gets passed
 * the current orientation.
 */
export class OrientationConsumer extends React.PureComponent<OrientationConsumerProps, {
  orientation: InterfaceOrientation;
}> {
  public state = { orientation: Orientation.interfaceOrientation.value };
  private subscription?: Releaseable;

  public constructor(props: OrientationConsumerProps) {
    super(props);
    this.state.orientation = Orientation.interfaceOrientation.value;
  }

  public componentDidMount() {
    this.subscription = Orientation.interfaceOrientation.subscribe((value) => {
      this.setState({ orientation: value });
    });
  }

  public componentWillUnmount() {
    if (this.subscription) {
      this.subscription.release();
      this.subscription = undefined;
    }
  }

  public render() {
    return this.props.children(this.state.orientation);
  }
}



export interface OrientationInjectedProps {
  orientation: InterfaceOrientation;
}

export function withOrientation<
  Props extends OrientationInjectedProps,
  // Props,
>(
  component: React.ComponentType<Props>
  // component: React.ComponentType<Props & SafeAreaInjectedProps>
): (
  // React.ComponentType<Props>
  React.ComponentType<Omit<Props, keyof OrientationInjectedProps>>
) {
  const Component = component as React.ComponentType<any>; // @TODO hmpf.
  // const Component = component;
  return React.forwardRef((props: Omit<Props, keyof OrientationInjectedProps>, ref) => (
    <OrientationConsumer>
      {(orientation) => (
        <Component orientation={orientation} ref={ref} {...props} />
      )}
    </OrientationConsumer>
  )) as any;
}

export function withOrientationDecorator<
  Props extends OrientationInjectedProps,
  ComponentType extends React.ComponentType<Props>
>(
  component: ComponentType & React.ComponentType<Props>
): (
  ComponentType &
  ( new (props: Omit<Props, keyof OrientationInjectedProps>, context?: any) => React.Component<Omit<Props, keyof OrientationInjectedProps>> )
) {
  const Component = component as any;
  const res = (props: Omit<Props, keyof OrientationInjectedProps>) => (
    <OrientationConsumer>
      {(orientation) => (
        <Component {...props} orientation={orientation} />
      )}
    </OrientationConsumer>
  );
  res.component = component;
  const skip: { [key: string]: boolean; } = {
    arguments: true,
    caller: true,
    callee: true,
    name: true,
    prototype: true,
    length: true,
  };
  for (const key of [...Object.getOwnPropertyNames(component), ...Object.getOwnPropertySymbols(component)]) {
    if (typeof key === 'string' && skip[key]) continue;
    const descriptor = Object.getOwnPropertyDescriptor(component, key);
    if (!descriptor) continue;
    try {
      Object.defineProperty(res, key, descriptor);
    } catch (e) {
    }
  }
  return res as any;
}



/**
 * lock the orientation to allowed as long as this component is mounted
 */
export class OrientationLock extends React.PureComponent<{
  /**
   * the allowed orientation, any of AllowedOrientations or an array of those.
   */
  allowed: 'portrait'|'landscape'|'any'|AllowedOrientations;
  children?: never;
}> {
  private lock?: Releaseable;

  private resolveAllowed(allowed: OrientationLock['props']['allowed']): AllowedOrientations {
    if (allowed === 'landscape') return AllowedOrientationsLandscape;
    if (allowed === 'portrait') return AllowedOrientationsPortrait;
    if (allowed === 'any') return AllowedOrientationsAny;
    return allowed;
  }

  public componentDidMount() {
    this.lock = Orientation.pushAllowedOrientations(this.resolveAllowed(this.props.allowed));
  }

  public componentWillUnmount() {
    if (this.lock) {
      this.lock.release();
      this.lock = undefined;
    }
  }

  public componentDidUpdate(prevProps: OrientationLock['props']) {
    if (JSON.stringify(Array.from(this.resolveAllowed(this.props.allowed))) !== JSON.stringify(Array.from(this.resolveAllowed(prevProps.allowed)))) {
      if (this.lock) {
        this.lock.release();
        this.lock = undefined;
      }
      this.lock = Orientation.pushAllowedOrientations(this.resolveAllowed(this.props.allowed));
    }
  }

  public render() {
    return null;
  }
}
