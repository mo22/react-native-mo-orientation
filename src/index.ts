import * as React from 'react';
import { StatefulEvent } from 'mo-core';
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
        ios.Module.startObservingOrientation();
        return () => {
          sub.remove();
          ios.Module!.stopObservingOrientation();
        };
      } else if (android.Events && android.Module) {
        let cur: number|undefined;
        const sub = android.Events.addListener('ReactNativeMoOrientation', (rs) => {
          if (rs.orientation === cur) return;
          cur = rs.orientation;
          emit(androidOrientationMap[rs.orientation]);
        });
        android.Module.startOrientationEvent();
        return () => {
          sub.remove();
          android.Module!.stopOrientationEvent();
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
  public static pushAllowedOrientations(orientations: AllowedOrientations) {
    this.allowedOrientationsStack.push(orientations);
    this.setAllowedOrientations(orientations);
    return {
      remove: () => {
        this.allowedOrientationsStack = this.allowedOrientationsStack.filter((i) => i !== orientations);
        this.setAllowedOrientations(this.allowedOrientationsStack.length ? this.allowedOrientationsStack.slice(-1)[0] : AllowedOrientationsPortrait);
      },
    };
  }

}



// export interface OrientationConsumerProps {
//   children: (orientation: Orientation) => React.ReactElement;
// }
//
// export class OrientationConsumer extends React.PureComponent<OrientationConsumerProps, {
//   orientation: Orientation;
// }> {
//   public state = { orientation: OrientationTools.interfaceOrientation.getValue() };
//   private subscription: Subscription;
//
//   public constructor(props: OrientationConsumerProps) {
//     super(props);
//     this.state.orientation = OrientationTools.interfaceOrientation.getValue();
//   }
//
//   public componentDidMount() {
//     this.subscription = OrientationTools.interfaceOrientation.subscribe((value) => {
//       this.setState({ orientation: value });
//     });
//   }
//
//   public componentWillUnmount() {
//     this.subscription.unsubscribe();
//   }
//
//   public render() {
//     return this.props.children(this.state.orientation);
//   }
// }

// export const OrientationConsumer = createObservableConsumer(OrientationTools.interfaceOrientation);

export interface OrientationInjectedProps {
  orientation: Orientation;
}

// export function withOrientation<
//   P extends OrientationInjectedProps,
//   S,
//   T extends React.ComponentClass<P, S>,
// >(
//   component: T & React.ComponentClass<P>
// ): (
//   T &
//   ( new (props: Omit<P, keyof OrientationInjectedProps>, context?: any) => React.Component<Omit<P, keyof OrientationInjectedProps>, S> )
// ) {
//   const Component = component as any;
//   const forwardRef = React.forwardRef<T, P>((props, ref) => (
//     <OrientationConsumer>
//       {(orientation) => (
//         <Component {...props} orientation={orientation} ref={ref} />
//       )}
//     </OrientationConsumer>
//   ));
//   const withStatics = hoistStatics(forwardRef, Component as any);
//   return withStatics as any;
// }

// export const withOrientation = createHOC((Component, props, ref) => (
//   <OrientationConsumer>
//     {(orientation) => (
//       <Component {...props} orientation={orientation} ref={ref} />
//     )}
//   </OrientationConsumer>
// ));



export class OrientationLock extends React.PureComponent<{
  allowed: AllowedOrientations|'portrait'|'landscape'|'any'|Orientation[];
}> {
  private lock?: { remove: () => void; };

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
      this.lock.remove();
      this.lock = undefined;
    }
  }

  public componentDidUpdate(prevProps: OrientationLock['props']) {
    if (JSON.stringify(Array.from(this.resolveAllowed(this.props.allowed))) !== JSON.stringify(Array.from(this.resolveAllowed(prevProps.allowed)))) {
      if (this.lock) {
        this.lock.remove();
        this.lock = undefined;
      }
      this.lock = Orientation.pushAllowedOrientations(this.resolveAllowed(this.props.allowed));
    }
  }

  public render() {
    return null;
  }
}
