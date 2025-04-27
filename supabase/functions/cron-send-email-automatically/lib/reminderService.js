"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var supabase_1 = require("./supabase");
var email_1 = require("./email");
function convertJHMToMinutes(jhm) {
    if (!jhm) {
        return 60;
    }
    var joursEnMinutes = jhm.j * 24 * 60;
    var heuresEnMinutes = jhm.h * 60;
    var minutes = jhm.m;
    return joursEnMinutes + heuresEnMinutes + minutes;
}
// Fonction pour récupérer les paramètres email de l'utilisateur
function getEmailSettings(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('email_settings')
                            .select('*')
                            .eq('user_id', userId)
                            .maybeSingle()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        if (error.code === 'PGRST116') {
                            return [2 /*return*/, null];
                        }
                        throw error;
                    }
                    return [2 /*return*/, data];
                case 2:
                    error_1 = _b.sent();
                    console.error('Erreur lors de la récupération des paramètres email:', error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getEmailSettings = getEmailSettings;
// Fonction pour formater le template avec les variables
function formatTemplate(template, variables) {
    var _a;
    return template
        .replace(/{company}/g, variables.company)
        .replace(/{amount}/g, new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(variables.amount))
        .replace(/{invoice_number}/g, variables.invoice_number)
        .replace(/{due_date}/g, new Date(variables.due_date).toLocaleDateString('fr-FR'))
        .replace(/{days_late}/g, variables.days_late.toString())
        .replace(/{days_left}/g, ((_a = variables.days_left) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
}
exports.formatTemplate = formatTemplate;
// Fonction pour déterminer le niveau de relance approprié
function determineReminderLevel(daysLate, client, status) {
    // Si aucun client n'est fourni, on retourne null
    if (!client)
        return { level: null, template: null };
    // Gestion des cas où une relance a déjà atteint le niveau final
    if (status === 'Relance finale')
        return { level: null, template: null };
    // Si une relance a déjà été faite avec un certain niveau,
    // on renvoie directement le niveau suivant avec le template correspondant
    if (status === 'Relance 3' && client.reminder_template_final)
        return { level: 'final', template: client.reminder_template_final };
    if (status === 'Relance 2' && client.reminder_template_3)
        return { level: 'third', template: client.reminder_template_3 };
    if (status === 'Relance 1' && client.reminder_template_2)
        return { level: 'second', template: client.reminder_template_2 };
    if (status === 'Relance préventive' && client.reminder_template_1)
        return { level: 'first', template: client.reminder_template_1 };
    // Si aucun statut de relance encore, on peut proposer un pré-reminder
    if (client.pre_reminder_template && daysLate <= 0) {
        return { level: 'pre', template: client.pre_reminder_template };
    }
    // Conversion des jours de retard en minutes (1 jour = 24h * 60min)
    var daysLateMinutes = daysLate * 24 * 60;
    // Vérification selon le nombre de minutes de retard et les templates disponibles
    // On commence par les relances les plus sévères (final → first)
    if (daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_final)) &&
        client.reminder_template_final) {
        return { level: 'final', template: client.reminder_template_final };
    }
    if (daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_3)) &&
        client.reminder_template_3) {
        return { level: 'third', template: client.reminder_template_3 };
    }
    if (daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_2)) &&
        client.reminder_template_2) {
        return { level: 'second', template: client.reminder_template_2 };
    }
    if (daysLateMinutes >= (convertJHMToMinutes(client.reminder_delay_1) || 15) &&
        client.reminder_template_1) {
        return { level: 'first', template: client.reminder_template_1 };
    }
    // Si aucun des cas ci-dessus ne s'applique, on retourne une relance préventive si disponible
    return { level: 'pre', template: client.pre_reminder_template || null };
}
exports.determineReminderLevel = determineReminderLevel;
// Fonction pour envoyer une relance manuelle
function sendManualReminder(receivableId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, receivable, receivableError, user, emailSettings, dueDate, today, daysLate, _b, level, template, emailContent, emailSent, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('receivables')
                            .select('*, client:clients(*)')
                            .eq('id', receivableId)
                            .single()];
                case 1:
                    _a = _c.sent(), receivable = _a.data, receivableError = _a.error;
                    if (receivableError)
                        throw receivableError;
                    if (!receivable)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, supabase_1.supabase.auth.getUser()];
                case 2:
                    user = (_c.sent()).data.user;
                    if (!user)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, getEmailSettings(user.id)];
                case 3:
                    emailSettings = _c.sent();
                    if (!emailSettings)
                        return [2 /*return*/, false];
                    dueDate = new Date(receivable.due_date);
                    today = new Date();
                    daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    _b = determineReminderLevel(daysLate, receivable.client, receivable.status), level = _b.level, template = _b.template;
                    if (!level || !template)
                        return [2 /*return*/, false];
                    emailContent = formatTemplate(template, {
                        company: receivable.client.company_name,
                        amount: receivable.amount,
                        invoice_number: receivable.invoice_number,
                        due_date: receivable.due_date,
                        days_late: daysLate || 0,
                        days_left: Math.max(0, -1 * daysLate)
                    });
                    return [4 /*yield*/, email_1.sendEmail(emailSettings, receivable.client.email, "Relance facture " + receivable.invoice_number, emailContent, receivable.invoice_pdf_url)];
                case 4:
                    emailSent = _c.sent();
                    if (!emailSent) return [3 /*break*/, 7];
                    // Enregistrer la relance
                    return [4 /*yield*/, supabase_1.supabase.from('reminders').insert({
                            receivable_id: receivableId,
                            reminder_type: level,
                            reminder_date: new Date().toISOString(),
                            email_sent: true,
                            email_content: emailContent
                        })];
                case 5:
                    // Enregistrer la relance
                    _c.sent();
                    // Mettre à jour le status de la créance
                    return [4 /*yield*/, supabase_1.supabase
                            .from('receivables')
                            .update({
                            status: level === 'first'
                                ? 'Relance 1'
                                : level === 'second'
                                    ? 'Relance 2'
                                    : level === 'third'
                                        ? 'Relance 3'
                                        : level === 'final'
                                            ? 'Relance finale'
                                            : level === 'pre'
                                                ? 'Relance préventive'
                                                : 'Relance',
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', receivableId)];
                case 6:
                    // Mettre à jour le status de la créance
                    _c.sent();
                    return [2 /*return*/, true];
                case 7: return [2 /*return*/, false];
                case 8:
                    error_2 = _c.sent();
                    console.error("Erreur lors de l'envoi de la relance:", error_2);
                    return [2 /*return*/, false];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.sendManualReminder = sendManualReminder;
// Fonction principale pour vérifier et envoyer les relances automatiques
// Fonction qui vérifie les factures en attente de paiement pour un utilisateur donné,
// puis envoie des emails de relance si nécessaire.
function getLastReminder(receivableId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('reminders')
                        .select('*')
                        .eq('receivable_id', receivableId)
                        .order('reminder_date', { ascending: false })
                        .limit(1)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error || !data || data.length === 0)
                        return [2 /*return*/, null];
                    return [2 /*return*/, data[0]];
            }
        });
    });
}
function sendOneReminder(receivableId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, receivable, receivableError, user, emailSettings, dueDate, today, daysLate, _b, level, template, lastReminder, now, shouldSend, delayMinutes, nextAllowed, reminderDelayField, delayMinutes, nextAllowed, emailContent, emailSent, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('receivables')
                            .select('*, client:clients(*)')
                            .eq('id', receivableId)
                            .single()];
                case 1:
                    _a = _c.sent(), receivable = _a.data, receivableError = _a.error;
                    if (receivableError)
                        throw receivableError;
                    if (!receivable)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, supabase_1.supabase.auth.getUser()];
                case 2:
                    user = (_c.sent()).data.user;
                    if (!user)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, getEmailSettings(user.id)];
                case 3:
                    emailSettings = _c.sent();
                    if (!emailSettings)
                        return [2 /*return*/, false];
                    dueDate = new Date(receivable.due_date);
                    today = new Date();
                    daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    _b = determineReminderLevel(daysLate, receivable.client, receivable.status), level = _b.level, template = _b.template;
                    if (!level || !template)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, getLastReminder(receivableId)];
                case 4:
                    lastReminder = _c.sent();
                    now = new Date();
                    shouldSend = true;
                    if (level === 'pre') {
                        // Prérelance uniquement si on est AVANT la date d’échéance
                        if (now.getTime() >= dueDate.getTime())
                            return [2 /*return*/, false];
                        if (lastReminder && lastReminder.reminder_type === 'pre') {
                            delayMinutes = 1;
                            nextAllowed = new Date(lastReminder.reminder_date);
                            nextAllowed.setMinutes(nextAllowed.getMinutes() + delayMinutes);
                            if (now < nextAllowed)
                                return [2 /*return*/, false];
                        }
                    }
                    else {
                        reminderDelayField = {
                            first: receivable.client.reminder_delay_1,
                            second: receivable.client.reminder_delay_2,
                            third: receivable.client.reminder_delay_3,
                            final: receivable.client.reminder_delay_final
                        }[level];
                        delayMinutes = convertJHMToMinutes(reminderDelayField);
                        if (lastReminder && lastReminder.reminder_type === level) {
                            nextAllowed = new Date(lastReminder.reminder_date);
                            nextAllowed.setMinutes(nextAllowed.getMinutes() + delayMinutes);
                            if (now < nextAllowed)
                                return [2 /*return*/, false];
                        }
                    }
                    emailContent = formatTemplate(template, {
                        company: receivable.client.company_name,
                        amount: receivable.amount,
                        invoice_number: receivable.invoice_number,
                        due_date: receivable.due_date,
                        days_late: daysLate || 0,
                        days_left: Math.max(0, -1 * daysLate)
                    });
                    return [4 /*yield*/, email_1.sendEmail(emailSettings, receivable.client.email, "Relance facture " + receivable.invoice_number, emailContent, receivable.invoice_pdf_url)];
                case 5:
                    emailSent = _c.sent();
                    if (!emailSent) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase_1.supabase.from('reminders').insert({
                            receivable_id: receivableId,
                            reminder_type: level,
                            reminder_date: new Date().toISOString(),
                            email_sent: true,
                            email_content: emailContent
                        })];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, supabase_1.supabase
                            .from('receivables')
                            .update({
                            status: level === 'first'
                                ? 'Relance 1'
                                : level === 'second'
                                    ? 'Relance 2'
                                    : level === 'third'
                                        ? 'Relance 3'
                                        : level === 'final'
                                            ? 'Relance finale'
                                            : level === 'pre'
                                                ? 'Relance préventive'
                                                : 'Relance',
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', receivableId)];
                case 7:
                    _c.sent();
                    return [2 /*return*/, true];
                case 8: return [2 /*return*/, false];
                case 9:
                    error_3 = _c.sent();
                    console.error("Erreur lors de l'envoi de la relance:", error_3);
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.sendOneReminder = sendOneReminder;
function shouldSendReminder(receivable) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!receivable.status || !receivable.due_date)
        return false;
    var now = new Date();
    var lastReminderAt = receivable.updated_at ? new Date(receivable.updated_at) : null;
    var delayMinutes = 0;
    switch (receivable.status) {
        case 'pending':
        case 'Relance préventive':
            delayMinutes = (_b = (_a = receivable.client) === null || _a === void 0 ? void 0 : _a.reminder_delay_1) !== null && _b !== void 0 ? _b : 0;
            break;
        case 'Relance 1':
            delayMinutes = (_d = (_c = receivable.client) === null || _c === void 0 ? void 0 : _c.reminder_delay_2) !== null && _d !== void 0 ? _d : 0;
            break;
        case 'Relance 2':
            delayMinutes = (_f = (_e = receivable.client) === null || _e === void 0 ? void 0 : _e.reminder_delay_3) !== null && _f !== void 0 ? _f : 0;
            break;
        case 'Relance 3':
            delayMinutes = (_h = (_g = receivable.client) === null || _g === void 0 ? void 0 : _g.reminder_delay_final) !== null && _h !== void 0 ? _h : 0;
            break;
        default:
            return false;
    }
    // 🟢 S’il n’y a jamais eu de relance => on envoie !
    if (!lastReminderAt)
        return true;
    var nextReminderTime = lastReminderAt.getTime() + delayMinutes * 60 * 1000;
    return now.getTime() >= nextReminderTime;
}
function AutomaticallySendReminders() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, receivables, error, _i, receivables_1, receivable, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('receivables')
                            .select('*, client:clients(*)')["in"]('status', ['pending', 'Relance 1', 'Relance 2', 'Relance 3', 'Relance finale', 'Relance préventive'])]; // ou selon tes statuts
                case 1:
                    _a = _b.sent() // ou selon tes statuts
                    , receivables = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    if (!receivables || receivables.length === 0)
                        return [2 /*return*/];
                    _i = 0, receivables_1 = receivables;
                    _b.label = 2;
                case 2:
                    if (!(_i < receivables_1.length)) return [3 /*break*/, 5];
                    receivable = receivables_1[_i];
                    if (!shouldSendReminder(receivable)) return [3 /*break*/, 4];
                    console.log("SEND REMINDERS FORM RECEIVABLE" + receivable.client.company_name + " WITH CURRENT STATUS " + receivable.status);
                    return [4 /*yield*/, sendOneReminder(receivable.id)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _b.sent();
                    console.error('Erreur lors de l’envoi automatique des relances :', err_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.AutomaticallySendReminders = AutomaticallySendReminders;
