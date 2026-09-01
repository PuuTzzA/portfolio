### Render Layers:
0. Both
1. Foreground only
2. Background only

### Data Layers:

0. **Buttons that are close to each other**: new SdfLayer(SdfCommands.SMOOTH_UNION, 5)
1. **Content, text, ...**: new SdfLayer(SdfCommands.SMOOTH_UNION, 20)
2. **Background box**: new SdfLayer(SdfCommands.SMOOTH_UNION, bgButtonSmoothness)
3. **Push Buttons, negative side**: new SdfLayer(SdfCommands.SMOOTH_SUBTRACTION, bgButtonSmoothness)
4. **Cursor**: new SdfLayer(SdfCommands.SMOOTH_UNION, 50)
