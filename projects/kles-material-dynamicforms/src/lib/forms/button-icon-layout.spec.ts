import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonAppearance } from '@angular/material/button';
import { MatIconRegistry } from '@angular/material/icon';
import { KlesButtonBase } from './button-control-base';
import { KlesButtonComponent } from './button-control.component';
import { KlesFabComponent } from './fab-control.component';
import { KlesMiniFabComponent } from './mini-fab-control.component';

const variants: { name: string; component: Type<KlesButtonBase>; appearance?: MatButtonAppearance }[] = [
    ...(['text', 'filled', 'elevated', 'outlined', 'tonal'] as MatButtonAppearance[])
        .map(appearance => ({ name: appearance, component: KlesButtonComponent, appearance })),
    { name: 'fab', component: KlesFabComponent },
    { name: 'mini-fab', component: KlesMiniFabComponent },
];

for (const { name, component, appearance } of variants) {
    describe(`${name} button icon layout`, () => {
        let fixture: ComponentFixture<KlesButtonBase>;
        let button: HTMLButtonElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule] });
            fixture = TestBed.createComponent(component);
            fixture.componentRef.setInput('label', 'Save');
            if (appearance) fixture.componentRef.setInput('buttonAppearance', appearance);
            fixture.detectChanges();
            button = fixture.nativeElement.querySelector('button');
        });

        afterEach(() => fixture.destroy());

        function expectIconInMaterialSlot() {
            const icon = button.querySelector('mat-icon')!;
            const label = button.querySelector('.mdc-button__label')!;
            expect(icon).not.toBeNull();
            expect(icon.parentElement).toBe(button);
            expect(label.contains(icon)).toBeFalse();
            expect(icon.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        }

        it('keeps a conditional font icon in the Material icon slot', () => {
            expect(button.querySelector('mat-icon')).toBeNull();
            fixture.componentRef.setInput('icon', 'save');
            fixture.detectChanges();
            expectIconInMaterialSlot();

            fixture.componentRef.setInput('loading', true);
            fixture.detectChanges();
            expectIconInMaterialSlot();
            expect(button.querySelectorAll('mat-icon').length).toBe(1);
            expect(button.querySelector('mat-spinner')).not.toBeNull();

            fixture.componentRef.setInput('loading', false);
            fixture.detectChanges();
            expectIconInMaterialSlot();
            expect(button.querySelector('mat-icon')!.textContent).toBe('save');
        });

        it('keeps a conditional SVG icon in the Material icon slot', () => {
            TestBed.inject(MatIconRegistry).addSvgIconLiteral('test-save', TestBed.inject(DomSanitizer)
                .bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>'));
            fixture.componentRef.setInput('iconSvg', 'test-save');
            fixture.detectChanges();
            expectIconInMaterialSlot();
            expect(button.querySelector('mat-icon svg')).not.toBeNull();
        });

        it('keeps the loading indicator in the icon slot without a configured icon', () => {
            fixture.componentRef.setInput('loading', true);
            fixture.detectChanges();
            expectIconInMaterialSlot();
            expect(button.querySelector('mat-spinner')).not.toBeNull();

            fixture.componentRef.setInput('loading', false);
            fixture.detectChanges();
            expect(button.querySelector('mat-icon')).toBeNull();
            expect(button.querySelector('.mdc-button__label')!.textContent).toContain('Save');
        });
    });
}
