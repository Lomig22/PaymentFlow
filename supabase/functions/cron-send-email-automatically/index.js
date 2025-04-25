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
require("dotenv/config");
var supabase_js_1 = require("@supabase/supabase-js");
var reminderService_1 = require("./lib/reminderService");
var email_1 = require("./lib/email");
var supabase = supabase_js_1.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function hasDelayPassed(since, delay) {
    var delayMs = (delay.j || 0) * 24 * 60 * 60 * 1000 +
        (delay.h || 0) * 60 * 60 * 1000 +
        (delay.m || 0) * 60 * 1000;
    var now = new Date();
    return now.getTime() >= new Date(since.getTime() + delayMs).getTime();
}
function AutomaticallySendReminders() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, receivables, error, _i, _b, receivable, due_date, client, id, status_1, today, dueDate, daysLate, reminderInfo, emailSettings, emailContent, emailSent, newStatus, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, supabase
                            .from('receivables')
                            .select('*, client:clients(*), reminders(*)')
                            .eq('status', 'En attente')];
                case 1:
                    _a = _c.sent(), receivables = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    if (!receivables || receivables.length === 0) {
                        console.log('Aucune créance à traiter');
                        return [2 /*return*/];
                    }
                    _i = 0, _b = receivables;
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    receivable = _b[_i];
                    due_date = receivable.due_date, client = receivable.client, id = receivable.id, status_1 = receivable.status;
                    if (!client || !client.email)
                        return [3 /*break*/, 7];
                    today = new Date();
                    dueDate = new Date(due_date);
                    daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    reminderInfo = reminderService_1.determineReminderLevel(daysLate, client, status_1);
                    if (!reminderInfo.level || !reminderInfo.template)
                        return [3 /*break*/, 7];
                    return [4 /*yield*/, reminderService_1.getEmailSettings(client.id)];
                case 3:
                    emailSettings = _c.sent();
                    if (!emailSettings)
                        return [3 /*break*/, 7];
                    emailContent = reminderService_1.formatTemplate(reminderInfo.template, {
                        company: client.company_name,
                        amount: receivable.amount,
                        invoice_number: receivable.invoice_number,
                        due_date: receivable.due_date,
                        days_late: daysLate || 0,
                        days_left: Math.max(0, -1 * daysLate)
                    });
                    return [4 /*yield*/, email_1.sendEmail(emailSettings, client.email, "Relance facture " + receivable.invoice_number, emailContent, receivable.invoice_pdf_url)];
                case 4:
                    emailSent = _c.sent();
                    if (!emailSent) return [3 /*break*/, 7];
                    console.log("\u2705 Email envoy\u00E9 pour la cr\u00E9ance " + receivable.invoice_number + " (" + reminderInfo.level + ")");
                    return [4 /*yield*/, supabase.from('reminders').insert({
                            receivable_id: id,
                            reminder_type: reminderInfo.level,
                            reminder_date: new Date().toISOString(),
                            email_sent: true,
                            email_content: emailContent
                        })];
                case 5:
                    _c.sent();
                    newStatus = reminderInfo.level === 'first'
                        ? 'Relance 1'
                        : reminderInfo.level === 'second'
                            ? 'Relance 2'
                            : reminderInfo.level === 'third'
                                ? 'Relance 3'
                                : reminderInfo.level === 'final'
                                    ? 'Relance finale'
                                    : 'Relance préventive';
                    return [4 /*yield*/, supabase
                            .from('receivables')
                            .update({ status: newStatus, updated_at: new Date().toISOString() })
                            .eq('id', id)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [3 /*break*/, 10];
                case 9:
                    err_1 = _c.sent();
                    console.error('❌ Erreur dans l’envoi automatique des relances :', err_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
AutomaticallySendReminders();
