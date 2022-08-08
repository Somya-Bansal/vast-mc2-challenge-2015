# vast-mc2-challenge-2015
## Data Visualization Project
[The project is hosted here](https://somya-bansal.github.io/vast-mc2-challenge-2015/)

This project attempts to solve the [2015 VAST MC2](https://vacommunity.org/2015+VAST+Challenge%3A+MC2) by exploring the in-app communication data collected during the Scott Jones celebration at the DinoFun World. We use five visualization techniques to answer the questions asked in the challenge. The system also provides more focused and detailed views of these visualizations by filtering on time and locations in the park.

The system is divided into two parts, a floating header at the top and a page body with all the visualizations. The header consists of input controls that can be used to filter the data which is then reflected in all the graphs in the body. There are four main filters:
1. **Weekend Days:** This dropdown can be used to choose the day of the weekend. By default, Friday is selected.
2. **Locations:** Consists of all the locations in the DinoFun Park. The user can choose a location to filter the data. By default, “All locations” is selected.
3. **External Communications:** The user can use this checkbox to add/remove communications received by the external ID.
4. **Outliers:** This checkbox adds/removes outlier IDs that have been identified to have significantly higher communication amount than others.

Following the header are the interactive visualizations.
