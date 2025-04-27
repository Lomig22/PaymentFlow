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
exports.sendEmail = function (settings, to, subject, htmlContent, invoice_pdf_url) { return __awaiter(void 0, void 0, void 0, function () {
    var auth_data, access_token, res, data, error, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                auth_data = localStorage.getItem('paymentflow-auth');
                if (!auth_data) return [3 /*break*/, 3];
                access_token = JSON.parse(auth_data).access_token;
                return [4 /*yield*/, fetch('https://rsomeerndudkhyhpigmn.supabase.co/functions/v1/send-smtp-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + access_token
                        },
                        body: JSON.stringify({
                            list: [
                                {
                                    settings: settings,
                                    to: to,
                                    subject: subject,
                                    html: "\n\t\t\t      <!DOCTYPE html>\n\t\t\t      <html>\n\t\t\t        <head>\n\t\t\t          <meta charset=\"utf-8\">\n\t\t\t          <title>" + subject + "</title>\n\t\t\t        </head>\n\t\t\t        <body style=\"font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;\">\n\t\t\t          <div style=\"max-width: 600px; margin: 0 auto;\">\n\t\t\t            " + htmlContent + "\n\t\t\t            " + (settings.email_signature
                                        ? "\n\t\t\t              <div style=\"margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;\">\n\t\t\t                " + settings.email_signature + "\n\t\t\t              </div>\n\t\t\t            "
                                        : '') + "\n\t\t\t          </div>\n\t\t\t        </body>\n\t\t\t      </html>\n\t\t\t    ",
                                    invoice_pdf_url: invoice_pdf_url
                                },
                            ]
                        })
                    })];
            case 1:
                res = _a.sent();
                console.log(JSON.stringify({
                    list: [
                        {
                            settings: settings,
                            to: to,
                            subject: subject,
                            html: "<html>...</html>",
                            invoice_pdf_url: invoice_pdf_url
                        }
                    ]
                }));
                return [4 /*yield*/, res.json()];
            case 2:
                data = _a.sent();
                error = data === null || data === void 0 ? void 0 : data.failures;
                if (error) {
                    console.error('Erreur Supabase Edge Function:', error);
                    throw error;
                }
                if (!(data === null || data === void 0 ? void 0 : data.success)) {
                    throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Échec de l'envoi de l'email");
                }
                return [2 /*return*/, true];
            case 3: return [2 /*return*/, false];
            case 4:
                error_1 = _a.sent();
                console.error("Erreur lors de l'envoi de l'email:", error_1);
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
