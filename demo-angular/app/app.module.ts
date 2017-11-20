import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppComponent } from "./app.component";

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [NativeScriptModule],
})
export class AppModule {}
