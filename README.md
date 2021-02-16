# Edit Virtual Hosts

Get the latest version from here: [https://github.com/manngo/edit-virtual-hosts/releases/latest](https://github.com/manngo/edit-virtual-hosts/releases/latest).

## Introduction

An Electron-based tool to simplify editing the `hosts` file and to create virtual hosts.

The application has the following benefits:

- Direct access to the relevant files
- It will ask for the administrator password to save protected files

Note:

-	The application has settings for XAMPP & MAMP.
-	AMPPS & WAMP have virtual host settings built in. However, you will still need to add the domain to the `hosts` file.


To add a virtual host:

1.	Add the domain to the `hosts` file
	At this stage, if that’s all you intend to do, you can finish. This is the case with AMPPS and WAMP.
	If, however, you are using XAMPP or MAMP, read on …
2.	Choose the Server Platform from the drop down.
3.	Allow Virtual Hosts
4.	Add the Virtual Host directive

##	Editing the `hosts` File

_Needless to say, you can really make a mess here, and break things. Be Careful._

- Select the `hosts File` tab.
- To add a local virtual domain, add something like the following:

	```
	127.0.0.1	www.example.com
	```
- Save (`Command-S` or `Ctrl-S`)

	You will be asked for the administrator password.

##	Allowing Virtual Hosts

-	Select the `httpd.conf` tab
-	Somewhere towards the end of the `httpd.conf` file, there is the following:

	```
	# Virtual hosts
	#Include etc/extra/httpd-vhosts.conf
	```

-	Remove the comment (`#`):

	```
	# Virtual hosts
	Include etc/extra/httpd-vhosts.conf
	```

-	Save

##	The Virtual Host Directive

The Virtual Host directive needs to be added. The easy way is to use the `Generator` tab to generate the directive.

-	Select the `Generator` tab.

You will need to add the following:

-	__Project Name:__ A simple name for the project, such as `example`. It will also be used to name the log files.
-	__Virtual Domain:__ The Domain Name, such as `www.example.com` (_without_ the `http://` protocol). When working, you can use `http://www.example.com` from your browser.
-	__Document Root:__ The full path name of you web root folder. For example:

	Mac: `/Users/mark/Documents/example`
	Win: `C:\users\mark\Documents\example`

	For Windows, you can use the forward slash (`/`) or backslash (`\`).

You can then generate the directive by clicking on the `Generate` button, or clicking inside the result area.

Copy the result and …

-	Select the `Virtual Hosts` tab
-	Paste the result at the bottom of the section
-	Save

Note: the result includes additional directives which should _not_ be added again if you are adding multiple Virtual Hosts:

###	XAMPP

The XAMPP result includes a `Required Default` section which should not be added again.

###	MAMP

The MAMP result includes a `NameVirtualHost *:80` directive which should not be added again.
