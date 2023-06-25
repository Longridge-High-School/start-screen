# Configuring Azure Application Proxy

Start Screen is designed to receive the current users email address in the
`azure-upn` header. When coupled with Single Sign On the user gets a seamless
experiance.

1. Open _Azure Active Directory_.
1. Open _Applications_ > _Enterprise Applications_ and select _Application
   Proxy_ from the sidebar.
   - If you don't already setup 1, ideally 2, connectors on site.
1. Open _Configure an app_.
   - Set the _Internal Url_ to `http://docker.host.name:3000/`
   - Set the _External Url_ to any subdomain.
   - Set _Pre Authentication_ to _Azure Active Directory_.
   - Upload an SSL Certificate that covers the _External Url_.
1. Setup the DNS Records as instructed in _Configure an app_.
1. Once the app has been created go into it's properties and under _Manage_
   select _Single sign-on_.
   - Choose the single sign-on mode of _Header-based_.
   - Create the header `azure-upn` with the value `user.userprincipalname`.
1. Once saved you will be able to access the start screen at your external url
   with seamless single sign on.
