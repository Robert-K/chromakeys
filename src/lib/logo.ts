export const logoString = `###-#-#-###-###-#####-###-#-#-###-#-#-###
#---#-#-#-#-#-#-#-#-#-#-#-##--##--#-#-##-
#---###-##--#-#-#-#-#-###-#-#-#----#----#
###-#-#-#-#-###-#-#-#-#-#-#-#-###--#--###`

export const logoArray = logoString.split('\n').map((line) => line.split('').map((char) => char === '#'))

export const paddedLogoArray = [
    new Array(logoArray[0].length + 2).fill(false),
    ...logoArray.map((line) => [false, ...line, false]),
    new Array(logoArray[0].length + 2).fill(false),
]
