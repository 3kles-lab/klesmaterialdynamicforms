import { InjectionToken } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { GroupUiState } from './ui/ui-state/group-ui-state';

export const FIELD_NAME = new InjectionToken<string>('FIELD_NAME');
export const GROUP = new InjectionToken<FormGroup>('GROUP');
export const SIBLING_FIELDS = new InjectionToken<IKlesFieldConfig[]>('SIBLING_FIELDS');
export const GROUP_UI = new InjectionToken<GroupUiState[]>('GROUP_UI');
export const FIELD = new InjectionToken<IKlesFieldConfig>('FIELD');
