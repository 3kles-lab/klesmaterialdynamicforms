import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlesDynamicFormComponent } from '../dynamic-form.component';
import { EnumType } from '../enums/type.enum';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFormImageUploadComponent } from './image-upload.component';

describe('KlesFormImageUploadComponent', () => {
    let fixture: ComponentFixture<KlesDynamicFormComponent>;

    function createField(overrides: Partial<IKlesFieldConfig> = {}): void {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormImageUploadComponent, NoopAnimationsModule],
        });
        fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [
            {
                type: EnumType.imageUpload,
                name: 'avatar',
                label: 'Photo de profil',
                hint: 'Image JPEG, PNG ou WebP de 2 Mo maximum.',
                ...overrides,
            },
        ] satisfies IKlesFieldConfig[]);
        fixture.detectChanges();
    }

    it('renders the configured image, label and hint', () => {
        createField({ imageUrl: '/avatar.webp', imageAlt: 'Avatar de Camille' });

        const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
        expect(image.getAttribute('src')).toBe('/avatar.webp');
        expect(image.alt).toBe('Avatar de Camille');
        expect(fixture.nativeElement.textContent).toContain('Photo de profil');
        expect(fixture.nativeElement.textContent).toContain('Image JPEG, PNG ou WebP de 2 Mo maximum.');
    });

    it('clears the form value and preview when the image is deleted', () => {
        createField({ imageUrl: '/avatar.webp', value: '/avatar.webp' });

        const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
        buttons.item(1).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.form.controls['avatar'].value).toBeNull();
        expect(fixture.nativeElement.querySelector('img')).toBeNull();
    });

    it('rejects a file larger than the configured limit', async () => {
        createField({ imageUploadOptions: { maxFileSize: 2 } });
        const component = fixture.debugElement.query((element) => element.componentInstance instanceof KlesFormImageUploadComponent)
            .componentInstance as KlesFormImageUploadComponent;
        const file = new File(['large'], 'avatar.png', { type: 'image/png' });

        await component.selectFile({ target: { files: { item: () => file } } } as unknown as Event);
        fixture.detectChanges();

        expect(fixture.componentInstance.form.controls['avatar'].hasError('imageFileSize')).toBeTrue();
        expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    });
});
