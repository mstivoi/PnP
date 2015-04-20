﻿(function () {
    'use strict';

    angular
        .module('app.wizard')
        .controller('WizardModalInstanceController', WizardModalInstanceController);
        //.value('urlparams', null);

    WizardModalInstanceController.$inject = ['$scope', '$log', '$modalInstance', 'Templates', 'utilservice', '$SharePointProvisioningService'];

    function WizardModalInstanceController($scope, $log, $modalInstance, Templates, $utilservice, $SharePointProvisioningService) {
        $scope.title = 'WizardModalInstanceController';
        
        var spHostWebUrl = $scope.spHostWebUrl;
        var spAppWebUrl = $scope.spAppWebUrl;       

        activate();

        $scope.siteConfiguration.spHostWebUrl = spHostWebUrl;
        $scope.siteConfiguration.spRootHostName = "Https://" + $utilservice.spRootHostName(spHostWebUrl); // still need to capture proto
        $scope.siteConfiguration.spNewSitePrefix = "Https://" + $utilservice.spRootHostName(spHostWebUrl) + "/sites/"; // still need to replace hardcoded /sites/        

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.finished = function () {
            //  save the site request when the wizard is complete
            var siteRequest = new Object();
            siteRequest.title = $scope.siteConfiguration.details.name;
            siteRequest.Url = $scope.siteConfiguration.details.url;
            siteRequest.Description = $scope.siteConfiguration.details.description;
            siteRequest.PrimaryOwner = $scope.siteConfiguration.primaryOwner;
            siteRequest.Template = $scope.siteConfiguration.template.title;
       
            saveSiteRequest(siteRequest);


            $modalInstance.close($scope.siteConfiguration);
        };

        $scope.interacted = function (field) {
            return field.$dirty;
        };               

        $scope.selectTemplate = function (template) {

            // Add the selected template to the configuration object
            $scope.siteConfiguration.template = template;

        }

               

        function activate() {

            $log.info($scope.title + ' Activated');
            $scope.siteConfiguration = {};

            // Initialize modal dialog box information
            initModal();
            getTemplates();           

        }

        function initModal() {

            $scope.steps = [1, 2, 3, 4, 5, 6, 7, 8];
            $scope.step = 0;
            $scope.wizard = { tacos: 2 };

            $scope.isCurrentStep = function (step) {
                return $scope.step === step;
            };

            $scope.setCurrentStep = function (step) {
                $scope.step = step -= 1;
            };

            $scope.getCurrentStep = function () {
                return $scope.steps[$scope.step];
            };

            $scope.isFirstStep = function () {
                return $scope.step === 0;
            };

            $scope.isLastStep = function () {
                return $scope.step === ($scope.steps.length - 1);
            };

            $scope.handlePrevious = function () {
                $scope.step -= ($scope.isFirstStep()) ? 0 : 1;
            };

            $scope.handleNext = function () {
                if ($scope.isLastStep()) {
                    //$modalInstance.close($scope.wizard);
                } else {
                    $scope.step += 1;
                }
            };          

        }

        function getTemplates() {
            //get the site templates
            $.when($SharePointProvisioningService.getSiteTemplates($scope)).done(function (jsonObject) {
                if (jsonObject != null) {
                    // Store returned templates 
                    $scope.templates = jsonObject;
                }

            }).fail(function (err) {
                console.info(JSON.stringify(err));
            });
        }

        function saveSiteRequest(request) {
            $.when($SharePointProvisioningService.saveRequest(request)).done(function (data) {
                if (data != null) {

                }
            }).fail(function (err) {
                console.log(err);
            });
            console.log(request);
        }

        $scope.getCurrentUser = function () {
            var executor = new SP.RequestExecutor($utilservice.spAppWebUrl());
            executor.executeAsync(
                   {
                       url: $utilservice.spAppWebUrl() + "/_api/web/currentuser",
                       method: "GET",
                       headers:
                       {
                           "accept": "application/json;odata=nometadata"
                       },
                       success: function (data) {
                           var jsonResults = JSON.parse(data.body);
                           $scope.siteConfiguration.primaryOwner = jsonResults.Email;

                       },
                       error: function () { alert("We are having problems retrieving specific information from the server. Please try again later") }
                   }
               );
        }
        
        $scope.getCurrentUser();

    }
})();
