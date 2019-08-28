import * as React from 'react';
import { StatefulEvent, Releaseable } from 'mo-core';
import * as ios from './ios';
import * as android from './android';

export enum InterfaceOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPELEFT = 'landscapeLeft',
  LANDSCAPERIGHT = 'landscapeRight',
}

export type AllowedOrientations = Set<InterfaceOrientation>;

export const AllowedOrientationsAny: AllowedOrientations = new Set<InterfaceOrientation>([
  InterfaceOrientation.PORTRAIT, InterfaceOrientation.LANDSCAPELEFT, InterfaceOrientation.LANDSCAPERIGHT,
]);
export const AllowedOrientationsPortrait: AllowedOrientations = new Set<InterfaceOrientation>([
  InterfaceOrientation.PORTRAIT,
]);
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

  public static readonly ios = ios;
  public static readonly android = android;

  public static readonly PORTRAIT = InterfaceOrientation.PORTRAIT;
  public static readonly LANDSCAPELEFT = InterfaceOrientation.LANDSCAPELEFT;
  public static readonly LANDSCAPERIGHT = InterfaceOrientation.LANDSCAPERIGHT;

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
      return InterfaceOrientation.PORTRAIT;
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
          if (rs.orientation === cur) return;
          cur = rs.orientation;
          emit(androidOrientationMap[rs.orientation]);
        });
        android.Module.enableOrientationEvent(true);
        return () => {
          sub.remove();
          android.Module!.enableOrientationEvent(false);
        };
      } else {
        return () => {
        };
      }
    }
  );

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
        android.Module.setRequestedOrientation(android.RequestOrientation.Portrait);
      } else if (orientations.has(InterfaceOrientation.LANDSCAPELEFT)) {
        android.Module.setRequestedOrientation(android.RequestOrientation.ReverseLandscape);
      } else if (orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
        android.Module.setRequestedOrientation(android.RequestOrientation.Landscape);
      }
    }
  }

  private static allowedOrientationsStack: AllowedOrientations[] = [];
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
  children: (orientation: Orientation) => React.ReactElement;
}

export class OrientationConsumer extends React.PureComponent<OrientationConsumerProps, {
  orientation: Orientation;
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
  orientation: Orientation;
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



export class OrientationLock extends React.PureComponent<{
  allowed: AllowedOrientations|'portrait'|'landscape'|'any'|Orientation[];
}> {
  private lock?: Releaseable;

  private resolveAllowed(allowed: OrientationLock['props']['allowed']): AllowedOrientations {
    if (allowed === 'landscape') return AllowedOrientationsLandscape;
    if (allowed === 'any') return AllowedOrientationsAny;
    if (typeof allowed === 'string') return new Set([allowed]) as AllowedOrientations;
    if (Array.isArray(allowed)) return new Set(allowed) as AllowedOrientations;
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
