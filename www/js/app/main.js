/*
  Copyright 2014 Marc Juul Maxb
  License: AGPLv3

  This file is part of service-browser.

  service-browser is free software: you can redistribute it 
  and/or modifyit under the terms of the GNU Affero General 
  Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any 
  later version.

  service-browser is distributed in the hope that it will be
  useful, but WITHOUT ANY WARRANTY; without even the implied
  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
  PURPOSE.  See the GNU Affero General Public License for 
  more details.

  You should have received a copy of the GNU Affero General 
  Public License along with service-browser. 
  If not, see <http://www.gnu.org/licenses/>.
*/

define(["jquery", "jquery.cookie", "sockjs", "json2", "handlebars", "lodash"], function($) {
  $(function() {
        
    console.log("web app initialized");
    var serviceTemplateSource = $("#service-template").html();
    var serviceTemplate = Handlebars.compile(serviceTemplateSource);

    var services = {};

    function service_up(service) {
      var containsService = _.contains(_.keys(services), service.unique);
      if (service.txtRecord.scope === "peoplesopen.net" && !containsService) {
        service.host = service.host.replace(/\.$/, '');

        var link = false;
        if(service.type.name === 'http') { 
          link = {
            url: 'http://'+service.host+':'+service.port+'/',
            name: service.name
          };
        } else if(service.type.name === 'https') {
          link = {
            url: 'https://'+service.host+':'+service.port+'/',
            name: service.name
          };
        } 
        var context = {
          link: link,
          name: service.name,
          id: service.unique,
          description: service.txtRecord.description
        }

        var html = serviceTemplate(context);

        $('.services-container').append(html);

        services[service.uniqeId] = service;
      }
    }

    function service_down(service) {
      var removeNode = $('.service-box[data-id="' + service.unique + '"]');
      if (removeNode.length > 0 ) {
        removeNode.remove();
      }
    }

    var sock = new SockJS('/websocket');

    sock.onopen = function() {
      console.log('open');
    };

    sock.onmessage = function(e) {
      console.log(e);
      var data = JSON.parse(e.data);;
      console.log(data);
      if(data.type == 'service') {

        if(data.action == 'up') {
          service_up(data.service);
        } else if(data.action == 'down') {
          service_down(data.service);
        }
      }
    };

    sock.onclose = function() {
      console.log('close');
    };  

  });
});
