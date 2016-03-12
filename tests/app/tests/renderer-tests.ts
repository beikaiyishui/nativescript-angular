//make sure you import mocha-config before angular2/core
import {assert} from "./test-config";
import {
    Component,
    ElementRef,
} from "angular2/core";
import {ProxyViewContainer} from "ui/proxy-view-container";
import {Red} from "color/known-colors";
import {dumpView} from "./test-utils";
import {TestApp} from "./test-app";

@Component({
    template: `<StackLayout><Label text="Layout"></Label></StackLayout>`
})
export class LayoutWithLabel {
    constructor(public elementRef: ElementRef) { }
}

@Component({
    selector: "label-cmp",
    template: `<Label text="Layout"></Label>`
})
export class LabelCmp {
    constructor(public elementRef: ElementRef) {
    }
}

@Component({
    directives: [LabelCmp],
    template: `<GridLayout><label-cmp></label-cmp></GridLayout>`
})
export class LabelContainer {
    constructor(public elementRef: ElementRef) { }
}

@Component({
    selector: "projectable-cmp",
    template: `<StackLayout><ng-content></ng-content></StackLayout>`
})
export class ProjectableCmp {
    constructor(public elementRef: ElementRef) {
    }
}
@Component({
    directives: [ProjectableCmp],
    template: `<GridLayout>
        <projectable-cmp><Button text="projected"></Button></projectable-cmp>
    </GridLayout>`
})
export class ProjectionContainer {
    constructor(public elementRef: ElementRef) { }
}

@Component({
    selector: "styled-label-cmp",
    styles: [
        "Label { color: red; }",
    ],
    template: `<Label text="Styled!"></Label>`
})
export class StyledLabelCmp {
    constructor(public elementRef: ElementRef) {
    }
}

@Component({
    selector: "ng-if-label",
    template: `<Label *ngIf="show" text="iffed"></Label>`
})
export class NgIfLabel {
    public show: boolean = false;
    constructor(public elementRef: ElementRef) {
    }
}

@Component({
    selector: "ng-for-label",
    template: `<Label *ngFor="#item of items" [text]="item"></Label>`
})
export class NgForLabel {
    public items: Array<string> = ["one", "two", "three"];
    constructor(public elementRef: ElementRef) {
    }
}


describe('Renderer E2E', () => {
    let testApp: TestApp = null;

    before(() => {
        return TestApp.create().then((app) => {
            testApp = app;
        })
    });

    after(() => {
        testApp.dispose();
    });

    afterEach(() => {
        testApp.disposeComponenets();
    });

    it("component with a layout", () => {
        return testApp.loadComponent(LayoutWithLabel).then((componentRef) => {
            const componentRoot = componentRef.instance.elementRef.nativeElement;
            assert.equal("(ProxyViewContainer (StackLayout (Label)))", dumpView(componentRoot));
        });
    });

    it("component without a layout", () => {
        return testApp.loadComponent(LabelContainer).then((componentRef) => {
            const componentRoot = componentRef.instance.elementRef.nativeElement;
            assert.equal("(ProxyViewContainer (GridLayout (ProxyViewContainer (Label))))", dumpView(componentRoot));
        });
    });

    it("projects content into components", () => {
        return testApp.loadComponent(ProjectionContainer).then((componentRef) => {
            const componentRoot = componentRef.instance.elementRef.nativeElement;
            assert.equal("(ProxyViewContainer (GridLayout (ProxyViewContainer (StackLayout (Button)))))", dumpView(componentRoot));
        });
    });

    it("applies component styles", () => {
        return testApp.loadComponent(StyledLabelCmp).then((componentRef) => {
            const componentRoot = componentRef.instance.elementRef.nativeElement;
            const label = (<ProxyViewContainer>componentRoot).getChildAt(0);
            assert.equal(Red, label.style.color.hex);
        });
    });

    describe("Structural directives", () => {
        it("ngIf hides component when false", () => {
            return testApp.loadComponent(NgIfLabel).then((componentRef) => {
                const componentRoot = componentRef.instance.elementRef.nativeElement;
                assert.equal("(ProxyViewContainer (template))", dumpView(componentRoot));
            });
        });

        it("ngIf show component when true", () => {
            return testApp.loadComponent(NgIfLabel).then((componentRef) => {
                const component = <NgIfLabel>componentRef.instance;
                const componentRoot = component.elementRef.nativeElement;

                component.show = true;
                testApp.appRef.tick();
                assert.equal("(ProxyViewContainer (template), (Label))", dumpView(componentRoot));
            });
        })

        it("ngFor creates element for each item", () => {
            return testApp.loadComponent(NgForLabel).then((componentRef) => {
                const componentRoot = componentRef.instance.elementRef.nativeElement;
                assert.equal("(ProxyViewContainer (template), (Label[text=one]), (Label[text=two]), (Label[text=three]))", dumpView(componentRoot, true));
            });
        });

        it("ngFor updates when item is removed", () => {
            return testApp.loadComponent(NgForLabel).then((componentRef) => {
                const component = <NgForLabel>componentRef.instance;
                const componentRoot = component.elementRef.nativeElement;

                component.items.splice(1, 1);
                testApp.appRef.tick();

                assert.equal("(ProxyViewContainer (template), (Label[text=one]), (Label[text=three]))", dumpView(componentRoot, true));
            });
        });

        it("ngFor updates when item is inserted", () => {
            return testApp.loadComponent(NgForLabel).then((componentRef) => {
                const component = <NgForLabel>componentRef.instance;
                const componentRoot = component.elementRef.nativeElement;

                component.items.splice(1, 0, "new");
                testApp.appRef.tick();

                assert.equal("(ProxyViewContainer (template), (Label[text=one]), (Label[text=new]), (Label[text=two]), (Label[text=three]))", dumpView(componentRoot, true));
            });
        });
    })
})