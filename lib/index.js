import * as React from 'react';
import { StatefulEvent } from 'mo-core';
import * as ios from './ios';
import * as android from './android';
import { Dimensions } from 'react-native';
export var InterfaceOrientation;
(function (InterfaceOrientation) {
    InterfaceOrientation["PORTRAIT"] = "portrait";
    InterfaceOrientation["LANDSCAPELEFT"] = "landscapeLeft";
    InterfaceOrientation["LANDSCAPERIGHT"] = "landscapeRight";
})(InterfaceOrientation || (InterfaceOrientation = {}));
/**
 * any direction
 */
export const AllowedOrientationsAny = new Set([
    InterfaceOrientation.PORTRAIT, InterfaceOrientation.LANDSCAPELEFT, InterfaceOrientation.LANDSCAPERIGHT,
]);
/**
 * portrait only
 */
export const AllowedOrientationsPortrait = new Set([
    InterfaceOrientation.PORTRAIT,
]);
/**
 * landscape only
 */
export const AllowedOrientationsLandscape = new Set([
    InterfaceOrientation.LANDSCAPELEFT, InterfaceOrientation.LANDSCAPERIGHT,
]);
const iosOrientationMap = {
    [ios.Orientation.Portrait]: InterfaceOrientation.PORTRAIT,
    [ios.Orientation.PortraitUpsideDown]: InterfaceOrientation.PORTRAIT,
    [ios.Orientation.LandscapeLeft]: InterfaceOrientation.LANDSCAPELEFT,
    [ios.Orientation.LandscapeRight]: InterfaceOrientation.LANDSCAPERIGHT,
};
const androidOrientationMap = {
    [android.Orientation.Portrait]: InterfaceOrientation.PORTRAIT,
    [android.Orientation.LandscapeLeft]: InterfaceOrientation.LANDSCAPELEFT,
    [android.Orientation.LandscapeRight]: InterfaceOrientation.LANDSCAPERIGHT,
};
export class Orientation {
    /**
     * set the allowed orientations globally
     */
    static setAllowedOrientations(orientations) {
        if (ios.Module) {
            ios.Module.setOrientationMask((orientations.has(InterfaceOrientation.PORTRAIT) ? ios.OrientationMask.Portrait : 0) +
                (orientations.has(InterfaceOrientation.LANDSCAPELEFT) ? ios.OrientationMask.LandscapeLeft : 0) +
                (orientations.has(InterfaceOrientation.LANDSCAPERIGHT) ? ios.OrientationMask.LandscapeRight : 0));
            if (!orientations.has(this.interfaceOrientation.value)) {
                if (orientations.has(InterfaceOrientation.PORTRAIT)) {
                    ios.Module.setOrientation(ios.Orientation.Portrait);
                }
                else if (orientations.has(InterfaceOrientation.LANDSCAPELEFT)) {
                    ios.Module.setOrientation(ios.Orientation.LandscapeLeft);
                }
                else if (orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
                    ios.Module.setOrientation(ios.Orientation.LandscapeRight);
                }
            }
        }
        else if (android.Module) {
            if (orientations.has(InterfaceOrientation.PORTRAIT) && orientations.has(InterfaceOrientation.LANDSCAPELEFT) && orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
                android.Module.setRequestedOrientation(android.RequestOrientation.Sensor);
            }
            else if (orientations.has(InterfaceOrientation.LANDSCAPELEFT) && orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
                android.Module.setRequestedOrientation(android.RequestOrientation.SensorLandscape);
            }
            else if (orientations.has(InterfaceOrientation.PORTRAIT)) {
                android.Module.setRequestedOrientation(android.RequestOrientation.Portrait);
            }
            else if (orientations.has(InterfaceOrientation.LANDSCAPELEFT)) {
                android.Module.setRequestedOrientation(android.RequestOrientation.ReverseLandscape);
            }
            else if (orientations.has(InterfaceOrientation.LANDSCAPERIGHT)) {
                android.Module.setRequestedOrientation(android.RequestOrientation.Landscape);
            }
        }
    }
    /**
     * lock the allowed orientations to orientations until lock is released
     * pushAllowedOrientations(...).release()
     */
    static pushAllowedOrientations(orientations) {
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
/**
 * native ios functions. use with caution
 */
Orientation.ios = ios;
/**
 * native android functions. use with caution
 */
Orientation.android = android;
/**
 * stateful event that provides the current interface orientation
 */
Orientation.interfaceOrientation = new StatefulEvent((() => {
    if (ios.Module && ios.Module.initialOrientation) {
        return iosOrientationMap[ios.Module.initialOrientation.interfaceOrientation];
    }
    if (android.Module) {
        android.Module.getOrientation().then((val) => {
            if (val)
                Orientation.interfaceOrientation.value = androidOrientationMap[val];
        });
    }
    const d = Dimensions.get('window');
    return (d.height > d.width) ? InterfaceOrientation.PORTRAIT : InterfaceOrientation.LANDSCAPELEFT;
})(), (emit) => {
    if (ios.Events && ios.Module) {
        let cur;
        const sub = ios.Events.addListener('ReactNativeMoOrientation', (rs) => {
            if (rs.interfaceOrientation === cur)
                return;
            cur = rs.interfaceOrientation;
            emit(iosOrientationMap[rs.interfaceOrientation]);
        });
        ios.Module.enableOrientationEvent(true);
        return () => {
            sub.remove();
            ios.Module.enableOrientationEvent(false);
        };
    }
    else if (android.Events && android.Module) {
        let cur;
        const sub = android.Events.addListener('ReactNativeMoOrientation', (rs) => {
            // rotation vs orientation?
            if (rs.rotation === cur)
                return;
            cur = rs.rotation;
            emit(androidOrientationMap[rs.rotation]);
        });
        android.Module.enableOrientationEvent(true);
        return () => {
            sub.remove();
            android.Module.enableOrientationEvent(false);
        };
    }
    else {
        let cur;
        const handler = ({ window }) => {
            const orientation = (window.height > window.width) ? InterfaceOrientation.PORTRAIT : InterfaceOrientation.LANDSCAPELEFT;
            if (orientation === cur)
                return;
            cur = orientation;
            emit(orientation);
        };
        Dimensions.addEventListener('change', handler);
        return () => {
            Dimensions.removeEventListener('change', handler);
        };
    }
});
Orientation.allowedOrientationsStack = [];
/**
 * consume the current orientation. takes a function as child that gets passed
 * the current orientation.
 */
export class OrientationConsumer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { orientation: Orientation.interfaceOrientation.value };
        this.state.orientation = Orientation.interfaceOrientation.value;
    }
    componentDidMount() {
        this.subscription = Orientation.interfaceOrientation.subscribe((value) => {
            this.setState({ orientation: value });
        });
    }
    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.release();
            this.subscription = undefined;
        }
    }
    render() {
        return this.props.children(this.state.orientation);
    }
}
export function withOrientation(component
// component: React.ComponentType<Props & SafeAreaInjectedProps>
) {
    const Component = component; // @TODO hmpf.
    // const Component = component;
    return React.forwardRef((props, ref) => (React.createElement(OrientationConsumer, null, (orientation) => (React.createElement(Component, Object.assign({ orientation: orientation, ref: ref }, props))))));
}
export function withOrientationDecorator(component) {
    const Component = component;
    const res = (props) => (React.createElement(OrientationConsumer, null, (orientation) => (React.createElement(Component, Object.assign({}, props, { orientation: orientation })))));
    res.component = component;
    const skip = {
        arguments: true,
        caller: true,
        callee: true,
        name: true,
        prototype: true,
        length: true,
    };
    for (const key of [...Object.getOwnPropertyNames(component), ...Object.getOwnPropertySymbols(component)]) {
        if (typeof key === 'string' && skip[key])
            continue;
        const descriptor = Object.getOwnPropertyDescriptor(component, key);
        if (!descriptor)
            continue;
        try {
            Object.defineProperty(res, key, descriptor);
        }
        catch (e) {
        }
    }
    return res;
}
/**
 * lock the orientation to allowed as long as this component is mounted
 */
export class OrientationLock extends React.PureComponent {
    resolveAllowed(allowed) {
        if (allowed === 'landscape')
            return AllowedOrientationsLandscape;
        if (allowed === 'portrait')
            return AllowedOrientationsPortrait;
        if (allowed === 'any')
            return AllowedOrientationsAny;
        return allowed;
    }
    componentDidMount() {
        this.lock = Orientation.pushAllowedOrientations(this.resolveAllowed(this.props.allowed));
    }
    componentWillUnmount() {
        if (this.lock) {
            this.lock.release();
            this.lock = undefined;
        }
    }
    componentDidUpdate(prevProps) {
        if (JSON.stringify(Array.from(this.resolveAllowed(this.props.allowed))) !== JSON.stringify(Array.from(this.resolveAllowed(prevProps.allowed)))) {
            if (this.lock) {
                this.lock.release();
                this.lock = undefined;
            }
            this.lock = Orientation.pushAllowedOrientations(this.resolveAllowed(this.props.allowed));
        }
    }
    render() {
        return null;
    }
}
//# sourceMappingURL=index.js.map