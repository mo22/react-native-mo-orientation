import * as React from 'react';
import * as ios from './ios';
import * as android from './android';
import { BehaviorSubjectWithCallback } from '../BehaviorSubjectWithCallback';
import { createHOC } from '../createHOC';
import { createObservableConsumer } from '../createObservableConsumer';
export const AllowedOrientationsAny = new Set(['portrait', 'landscapeLeft', 'landscapeRight']);
export const AllowedOrientationsPortrait = new Set(['portrait']);
export const AllowedOrientationsLandscape = new Set(['landscapeLeft', 'landscapeRight']);
const iosOrientationMap = {
    [ios.Orientation.Portrait]: 'portrait',
    [ios.Orientation.PortraitUpsideDown]: 'portrait',
    [ios.Orientation.LandscapeLeft]: 'landscapeLeft',
    [ios.Orientation.LandscapeRight]: 'landscapeRight',
};
const androidOrientationMap = {
    [android.Orientation.Portrait]: 'portrait',
    [android.Orientation.LandscapeLeft]: 'landscapeLeft',
    [android.Orientation.LandscapeRight]: 'landscapeRight',
};
export class OrientationTools {
    static getInitialOrientation() {
        if (ios.Module && ios.Module.initialOrientation) {
            return iosOrientationMap[ios.Module.initialOrientation.interfaceOrientation];
        }
        if (android.Module) {
            android.Module.getOrientation().then((value) => {
                const interfaceOrientation = androidOrientationMap[value];
                if (interfaceOrientation === this.interfaceOrientation.getValue())
                    return;
                this.interfaceOrientation.next(interfaceOrientation);
            });
        }
        return 'portrait';
    }
    static interfaceOrientationSubscribe(active) {
        if (this.interfaceOrientationSubscription) {
            if (android.Module && android.Events) {
                android.Module.stopOrientationEvent();
            }
            this.interfaceOrientationSubscription.remove();
            this.interfaceOrientationSubscription = undefined;
        }
        if (active) {
            if (ios.Events) {
                ios.Events.addListener('ReactNativeMoOrientation', (rs) => {
                    const interfaceOrientation = iosOrientationMap[rs.interfaceOrientation];
                    if (interfaceOrientation === this.interfaceOrientation.getValue())
                        return;
                    this.interfaceOrientation.next(interfaceOrientation);
                });
            }
            else if (android.Module && android.Events) {
                android.Module.startOrientationEvent();
                android.Events.addListener('ReactNativeMoOrientation', (rs) => {
                    const interfaceOrientation = androidOrientationMap[rs.orientation];
                    if (interfaceOrientation === this.interfaceOrientation.getValue())
                        return;
                    this.interfaceOrientation.next(interfaceOrientation);
                });
            }
        }
    }
    static setAllowedOrientations(orientations) {
        if (ios.Module) {
            ios.Module.setOrientationMask((orientations.has('portrait') ? ios.OrientationMask.Portrait : 0) +
                (orientations.has('landscapeLeft') ? ios.OrientationMask.LandscapeLeft : 0) +
                (orientations.has('landscapeRight') ? ios.OrientationMask.LandscapeRight : 0));
            if (!orientations.has(this.interfaceOrientation.getValue())) {
                if (orientations.has('portrait')) {
                    ios.Module.setOrientation(ios.Orientation.Portrait);
                }
                else if (orientations.has('landscapeLeft')) {
                    ios.Module.setOrientation(ios.Orientation.LandscapeLeft);
                }
                else if (orientations.has('landscapeRight')) {
                    ios.Module.setOrientation(ios.Orientation.LandscapeRight);
                }
            }
        }
        else if (android.Module) {
            if (orientations.has('portrait') && orientations.has('landscapeLeft') && orientations.has('landscapeRight')) {
                android.Module.setRequestedOrientation(android.RequestOrientation.Sensor);
            }
            else if (orientations.has('landscapeLeft') && orientations.has('landscapeRight')) {
                android.Module.setRequestedOrientation(android.RequestOrientation.SensorLandscape);
            }
            else if (orientations.has('portrait')) {
                android.Module.setRequestedOrientation(android.RequestOrientation.Portrait);
            }
            else if (orientations.has('landscapeLeft')) {
                android.Module.setRequestedOrientation(android.RequestOrientation.ReverseLandscape);
            }
            else if (orientations.has('landscapeRight')) {
                android.Module.setRequestedOrientation(android.RequestOrientation.Landscape);
            }
        }
    }
    static pushAllowedOrientations(orientations) {
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
OrientationTools.interfaceOrientation = new BehaviorSubjectWithCallback(OrientationTools.getInitialOrientation(), (active) => {
    OrientationTools.interfaceOrientationSubscribe(active);
});
OrientationTools.allowedOrientationsStack = [];
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
export const OrientationConsumer = createObservableConsumer(OrientationTools.interfaceOrientation);
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
export const withOrientation = createHOC((Component, props, ref) => ({}(orientation)));
({ ...props });
orientation = { orientation };
ref = { ref } /  >
;
/OrientationConsumer>;
;
export class OrientationLock extends React.PureComponent {
    resolveAllowed(allowed) {
        if (allowed === 'landscape')
            return AllowedOrientationsLandscape;
        if (allowed === 'any')
            return AllowedOrientationsAny;
        if (typeof allowed === 'string')
            return new Set([allowed]);
        if (Array.isArray(allowed))
            return new Set(allowed);
        return allowed;
    }
    componentDidMount() {
        this.lock = OrientationTools.pushAllowedOrientations(this.resolveAllowed(this.props.allowed));
    }
    componentWillUnmount() {
        this.lock.remove();
    }
    componentDidUpdate(prevProps) {
        if (JSON.stringify(Array.from(this.resolveAllowed(this.props.allowed))) !== JSON.stringify(Array.from(this.resolveAllowed(prevProps.allowed)))) {
            this.lock.remove();
            this.lock = OrientationTools.pushAllowedOrientations(this.resolveAllowed(this.props.allowed));
        }
    }
    render() {
        return null;
    }
}
//# sourceMappingURL=index.js.map