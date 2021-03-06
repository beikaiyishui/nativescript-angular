import "application";

export * from "./platform-common";
export * from "./platform";
export * from "./platform-static";
export * from "./router";
export * from "./forms";
export * from "./http";
export * from "./directives";
export * from "./common/detached-loader";
export * from "./trace";
export * from "./platform-providers";
export * from "./file-system/ns-file-system";
export * from "./modal-dialog";
export * from "./renderer";
export * from "./view-util";
export * from "./animation-driver";
export * from "./resource-loader";
export {
    ViewResolver,
    TEMPLATE,
    ViewClass,
    ViewClassMeta,
    registerElement,
    getViewClass,
    getViewMeta,
    isKnownView,
    TemplateView
} from "./element-registry";
export * from "./value-accessors/base-value-accessor";
