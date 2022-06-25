# Custom Icons for Services

## How are icons requested?
The icons used in Homarr are automatically requested from the [dashboard-icons](https://github.com/walkxhub/dashboard-icons) repo.

Icons are requested in the following way:

1. Grab Name
2. Replace " " with "-"
3. Convert to lowercase
4. Insert in link: `https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/{name}.png`

![firefox_vCMTN5meLp](https://user-images.githubusercontent.com/71191962/170118033-a72ea587-4df0-43dd-8b7e-e0e7bae45dc6.gif)

## Adding your own icon(s)
1. Mount the `/app/public/icons` folder of your docker container.

![image](https://user-images.githubusercontent.com/71191962/170479022-2f4176c8-9efc-496c-b419-2fc116cc3082.png)

2. Add any icon(s) to the folder.

3. Access the icon(s) using `/icons/name.png` or `/icons/name.svg`.

![image](https://user-images.githubusercontent.com/71191962/170479159-5df02aa0-683a-44f2-bdcf-4f58585655dd.png)

:::info

If you're unable to load your cusotom icons, make sure that you've set the permissions correctly. Running ``chmod 755 /app/public/icons -R`` might resolve the issue.

:::
