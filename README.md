# TableMap - Display FoundryVTT upon your table with embedded screen!

Simply create a placeholder user with a placeholder character, give the user 'Observer' permissions for all characters that you the table map to see.

Then assign that user in settings, input the diagoal size of your display and away you go!

Checkout the [hotkeys](#hotkeys) for more information on use.

## Settings

### Display User

User that will have UI hidden and map automatically scaled. Ensure they have a placeholder character and have 'Observer' permissions for all player characters

### Diagonal size of display

Input number in inches. (Used with screen resolution to calculate correct canvas scale, so each map square will be 1 inch)

### Custom DPI override

Force a custom DPI override for scale calculation, if you do not want the module to calculate the DPI (or it's calculating incorrectly)

## Hotkeys

| Name              | Default key | Description                                                |
| :---------------- | :---------: | :--------------------------------------------------------- |
| Pan to centre     |     `T`     | Pans and scales the map to the centre for the display user |
| Toggle fullscreen |     `F`     | Sets browser to be fullscreen                              |
| Toggle UI         |     `U`     | Hide or show the Foundry UI                                |

## Future enhancements

- Implement hotkeys to pan the screen in cases where the map is larger than the optimal map size for a screen
- Implement socket use, to allow a DM to send hotkey commands to the display user's session

## Development

### Requirements

- Node
- NPM

### Set-up

1. `npm i`
2. `npm run dev`
3. Symlink the `dist` folder into `FoundryVTT/Data/modules/table-map`

## License

Copyright &copy; 2022 Ben Williams

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

A copy of the GNU General Public License can be found at http://www.gnu.org/licenses/.

For your convenience, a copy of this license is included.
