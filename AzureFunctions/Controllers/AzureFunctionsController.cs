﻿using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using AzureFunctions.Trace;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace AzureFunctions.Controllers
{
    public class AzureFunctionsController : ApiController
    {
        private readonly IArmManager _armManager;
        private readonly ITemplatesManager _templatesManager;
        private readonly HttpClient _client;

        public AzureFunctionsController(IArmManager armManager, ITemplatesManager templatesManager, HttpClient client)
        {
            this._armManager = armManager;
            this._templatesManager = templatesManager;
            this._client = client;
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> CreateTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                try
                {
                    var functionsResource = await this._armManager.CreateTrialFunctionsResource();
                    perf.AddProperties("Created");
                    return Request.CreateResponse(HttpStatusCode.Created, functionsResource);

                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInCreateTrialFunctionContainer, e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }
        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> ExtendTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                try
                {
                    var functionsResource = await this._armManager.ExtendTrialFunctionsResource();
                    perf.AddProperties("Extended");
                    return Request.CreateResponse(HttpStatusCode.OK, functionsResource);

                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInCreateTrialFunctionContainer, e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> GetTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                try
                {
                    var functionsResource = await this._armManager.GetTrialFunctionsResource();
                    perf.AddProperties("Created");
                    return Request.CreateResponse(HttpStatusCode.OK, functionsResource);
                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInCreateTrialFunctionContainer, e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }

        [Authorize]
        [HttpGet]
        public HttpResponseMessage ListTemplates()
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                return Request.CreateResponse(HttpStatusCode.OK, _templatesManager.GetTemplates());
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBindingConfig()
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _templatesManager.GetBindingConfigAsync());
        }

        [Authorize]
        [HttpPost]
        public HttpResponseMessage ReportClientError([FromBody] ClientError clientError)
        {
            FunctionsTrace.Diagnostics.Error(new Exception(clientError.Message), TracingEvents.ClientError.Message, clientError.Message, clientError.StackTrace);
            return Request.CreateResponse(HttpStatusCode.Accepted);
        }
    }
}