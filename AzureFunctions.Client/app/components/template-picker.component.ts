﻿import {Component, Output, Input, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import {TemplatePickerType, Template} from '../models/template-picker';
import {BindingComponent} from './binding.component';
import {DirectionType, Binding} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {LanguageType, TemplateFilterItem, FunctionTemplate} from '../models/template';
import {FunctionsService} from '../services/functions.service';
import {GlobalStateService} from '../services/global-state.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {DropDownComponent} from './drop-down.component';
import {DropDownElement} from '../models/drop-down-element';

@Component({
    selector: 'template-picker',
    templateUrl: './templates/template-picker.component.html',
    inputs: ['type'],
    styleUrls: ['styles/template-picker.style.css'],
    directives: [DropDownComponent]
})

export class TemplatePickerComponent {
    public languages: DropDownElement<string>[] = [];
    public categories: DropDownElement<string>[] = [];

    title: string;
    selectedTemplate: string;
    templates: Template[] = [];
    filterItems: TemplateFilterItem[] = [];
    bc: BindingManager = new BindingManager();
    bindings: Binding[];
    private category: string = "";
    private _language: string = "All";
    private _type: TemplatePickerType;
    private _initialized = false;
    private _orderedCategoties = [
        "Core",
        "API & Webhooks",
        "Data Processing",
        "Samples",
        "Experimental",
        "All"
    ];

    @Input() showFooter: boolean;
    @Output() complete: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancel: EventEmitter<string> = new EventEmitter<string>();

    constructor(private _functionsService: FunctionsService,
        private _globalStateService: GlobalStateService) {
    }

    set type(type: TemplatePickerType) {
        var that = this;
        this._type = type;
        this._globalStateService.setBusyState();
        this._functionsService.getTemplates().subscribe((templates) => {
            this._functionsService.getBindingConfig().subscribe((config) => {
                var that = this;
                this._globalStateService.clearBusyState();
                this.bindings = config.bindings;
                this.templates = [];
                switch (type) {
                    case TemplatePickerType.in:
                        this.title = "Choose an input binding";
                        this.templates = this.getBindingTemplates(DirectionType.in);

                        break;
                    case TemplatePickerType.out:
                        this.title = "Choose an output binding";
                        this.templates = this.getBindingTemplates(DirectionType.out);
                        break;
                    case TemplatePickerType.trigger:
                        this.title = "Choose a trigger";
                        this.templates = this.getBindingTemplates(DirectionType.trigger);
                        break;
                    case TemplatePickerType.template:
                        this.title = "Choose a template";

                        let initLanguages = false, initCategories = false;
                        if (this.languages.length === 0) {
                            this.languages = [{ displayLabel: "All", value: "All" }];
                            initLanguages = true;
                        }


                        if (this.categories.length === 0) {
                            this.categories = [{ displayLabel: "All", value: "All" }];
                            initCategories = true;
                        }

                        templates.forEach((template) => {

                            if (template.metadata.visible === false) {
                                return;
                            }

                            if (!this.getFilterMatach(template.metadata.filters)) {
                                return;
                            }

                            if (initLanguages) {
                                var lang = this.languages.find((l) => {
                                    return l.value === template.metadata.language;
                                });
                                if (!lang) {
                                    this.languages.push({
                                        displayLabel: template.metadata.language,
                                        value: template.metadata.language
                                    });
                                }
                            }

                            if (initCategories) {
                                template.metadata.category.forEach((c) => {
                                    if ((this._language === "All") || (template.metadata.language === this._language)) {

                                        var index = this.categories.findIndex((category) => {
                                            return category.value === c;
                                        });

                                        if (index === -1) {
                                            var dropDownElement: any = {
                                                displayLabel: c,
                                                value: c
                                            };

                                            if (this.category === c) {
                                                dropDownElement.default = true;
                                            } else if (!this.category && c === "Core") {
                                                dropDownElement.default = true;
                                            }

                                            this.categories.push(dropDownElement);
                                        }
                                    }
                                });
                            }

                            var matchIndex = template.metadata.category.findIndex((c) => {
                                return c === this.category || this.category === "All";
                            });

                            if (matchIndex !== -1) {
                                if ((this._language === "All") || (template.metadata.language === this._language)) {
                                    var keys = template.metadata.category.slice(0) || ["Experimental"];
                                    keys.push(
                                        template.metadata.language
                                    );

                                    this.templates.push({
                                        name: template.metadata.name,
                                        value: template.id,
                                        keys: keys,
                                        description: template.metadata.description
                                    });
                                }
                            }
                        });

                        var counter = 0;
                        var that = this;
                        this._orderedCategoties.forEach((c) => {
                            var temp = this.categories;
                            var index = this.categories.findIndex((item) => {
                                return c === item.displayLabel;
                            });
                            if (index > 0) {
                                var save = this.categories[index];
                                this.categories.splice(index, 1);
                                this.categories.splice(counter, 0, save);
                                counter++;
                            }
                        });

                        this.languages = this.languages.sort((a: DropDownElement<string>, b: DropDownElement<string>) => {
                            return a.displayLabel > b.displayLabel ? 1 : -1;
                        });
                }
            });
        });
    }

    ngOnInit() {
    }

    onSelectClicked() {
        this.complete.emit(this.selectedTemplate); // this fires an eventClicked
        this.selectedTemplate = "";
    }

    onCancelClicked() {
        this.cancel.emit(""); // this fires an eventClicked
    }

    onTemplateCliked(template: string) {
        this.selectedTemplate = template;
        if (!this.showFooter) {
            this.complete.emit(this.selectedTemplate);
        }
    }

    onLanguageChanged(language: string) {
        if (this._language !== language) {
            this._language = language;
            this.categories = [];
            this.type = this._type;
        }
    }

    onScenarioChanged(category: string) {
        if (this.category !== category) {
            this.category = category;
            this.type = this._type;
        }
    }

    private getBindingTemplates(direction: DirectionType): Template[] {
        var result: Template[] = [];
        var filtered = this.bindings.filter((b) => {
            return b.direction === direction;
        });

        filtered.forEach((binding) => {

            if (this.getFilterMatach(binding.filters)) {

                result.push({
                    name: binding.displayName.toString(),
                    value: binding.type.toString()
                });

            }
        });

        return result;
    }

    private getFilterMatach(filters: string[]) : boolean {
        var isFilterMatch = true;
        if (filters && filters.length > 0) {
            isFilterMatch = false;
            for (var i = 0; i < filters.length; i++) {
                var value = this.getQueryStringValue(filters[i]);
                if (value) {
                    isFilterMatch = true;
                    break;
                }
            }
        }
        return isFilterMatch;
    }

    private getQueryStringValue(key) {
        //http://stackoverflow.com/questions/9870512/how-to-obtaining-the-querystring-from-the-current-url-with-javascript
        return window.location.search.replace(new RegExp("^(?:.*[&\\?]" + key.replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1");
    }

}