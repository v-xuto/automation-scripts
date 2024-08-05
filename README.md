## Overview
First, the script is used for automatic check [Awesome Azure Developer CLI](https://azure.github.io/awesome-azd/?tags=msft) changes of templates, and output the new and deleted templates to the `AwesomeAzd-CompareResult.json` file in the data folder.   
Second, the script is used to automate the comparison of templates in [Awesome Azure Developer CLI](https://azure.github.io/awesome-azd/?tags=msft) and [Browse code samples | Microsoft Learn](https://learn.microsoft.com/en-us/samples/browse/?expanded=azure&languages=azdeveloper), and output the templates that are not published to [Browse code samples | Microsoft Learn](https://learn.microsoft.com/en-us/samples/browse/?expanded=azure&languages=azdeveloper) to the `NotPublishToLearnWebsite-Templates.txt` file in the data folder.

## Key directory structure

- data : Used to store relevant data and final results during code execution.
    - AwesomeAzd-LatestTemplates.txt : Saved the latest templates from [Awesome Azure Developer CLI](https://azure.github.io/awesome-azd/?tags=msft) . Writing them by executing the code.
    - AwesomeAzd-OldTemplates.txt : Used to save the template from the last execution of [Awesome Azure Developer CLI](https://azure.github.io/awesome-azd/?tags=msft). The template can be written by executing the code or entered manually.
    - AwesomeAzd-CompareResult.json : Saved the newly added and deleted templates from [Awesome Azure Developer CLI](https://azure.github.io/awesome-azd/?tags=msft). Writing them by executing the code.
    - LearnWebsite-LatestTemplates.txt ： Saved the latest templates from [Browse code samples | Microsoft Learn](https://learn.microsoft.com/en-us/samples/browse/?expanded=azure&languages=azdeveloper). Writing them by executing the code.
    - NotPublishToLearnWebsite-Templates.txt： Saves the templates that are not published to [Browse code samples | Microsoft Learn](https://learn.microsoft.com/en-us/samples/browse/?expanded=azure&languages=azdeveloper). Writing them by executing the code.
- src : Source code
    - Awesome-CLI.js : The script is used for automatic check [Awesome Azure Developer CLI](https://azure.github.io/awesome-azd/?tags=msft) changes of templates, and output the new and deleted templates to a json file in the data folder. 
    - Learn-Website.js : the script is used to automate the comparison of templates in [Awesome Azure Developer CLI](https://azure.github.io/awesome-azd/?tags=msft) and [Browse code samples | Microsoft Learn](https://learn.microsoft.com/en-us/samples/browse/?expanded=azure&languages=azdeveloper), and output the templates that are not published to [Browse code samples | Microsoft Learn](https://learn.microsoft.com/en-us/samples/browse/?expanded=azure&languages=azdeveloper) to the txt file in the data folder.
- .env : Save the relevant environment variables at the time of code execution


## Start
### Install the package
```
npm install

npx playwright install
```
### Run code
This instruction `npm run task-A` is used for automatic check Awesome Azure Developer CLI changes of templates, and output the new and deleted templates to the AwesomeAzd-CompareResult.json file in the data folder.

```
npm run task-A
```

This instruction `npm run task-L` is used to automate the comparison of templates in Awesome Azure Developer CLI and Browse code samples | Microsoft Learn, and output the templates that are not published to Browse code samples | Microsoft Learn to the NotPublishToLearnWebsite-Templates.txt file in the data folder.
```
npm run task-L
```
### Result 
View the result in the corresponding file under the data folder.