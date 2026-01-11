/**
 * Template Engine using Handlebars
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

// Register Handlebars helpers
Handlebars.registerHelper('year', () => new Date().getFullYear());

/**
 * Load and compile a Handlebars template
 */
function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
    const templateContent = readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
}

/**
 * Load and compile the layout template
 */
function loadLayout(): HandlebarsTemplateDelegate {
    const layoutPath = join(__dirname, 'templates', 'layout.hbs');
    const layoutContent = readFileSync(layoutPath, 'utf-8');
    return Handlebars.compile(layoutContent);
}

// Pre-compile templates for better performance
const layoutTemplate = loadLayout();
const invitationTemplate = loadTemplate('invitation');
const eventUpdateTemplate = loadTemplate('event-update');

/**
 * Render a template with layout
 */
export function renderTemplate(
    templateName: string,
    data: any,
    subject: string
): string {
    let content: string;

    switch (templateName) {
        case 'invitation':
            content = invitationTemplate(data);
            break;
        case 'event-update':
            content = eventUpdateTemplate(data);
            break;
        default:
            throw new Error(`Unknown template: ${templateName}`);
    }

    // Wrap content in layout
    return layoutTemplate({
        subject,
        content,
        year: new Date().getFullYear(),
    });
}

/**
 * Render invitation email
 */
export function renderInvitationEmail(
    data: any,
    subject: string = "You're Invited!"
): string {
    return renderTemplate('invitation', data, subject);
}

/**
 * Render event update email
 */
export function renderEventUpdateEmail(
    data: any,
    subject: string = 'Event Details Updated'
): string {
    return renderTemplate('event-update', data, subject);
}
